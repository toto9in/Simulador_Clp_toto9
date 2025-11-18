# Testes que Requerem Revisão Manual

**Status Atual**: 714/798 testes passando (89.5%)
**Data**: 2025-11-17

## Resumo

Este documento lista os testes que estão falhando e que parecem indicar problemas de lógica real no código, não apenas problemas de teste. Estes itens precisam de revisão manual para determinar se o comportamento atual está correto ou se há um bug real.

---

## 🔴 Prioridade Alta - Problemas de Lógica Core

### 1. Counters (CTU/CTD) - Comportamento de Primeira Execução

**Arquivo**: `src/services/interpreter.ts`
**Testes Afetados**:
- `__tests__/unit/interpreter.counters.test.ts` - 3 testes falhando
- `__tests__/integration/buttonTypes.test.ts` - 1 teste
- `__tests__/integration/complexScenarios.test.ts` - 7 testes

**Problema**: Os contadores estão incrementando/decrementando na primeira execução quando o acumulador está TRUE, mas os testes esperam que NÃO aconteça nada na primeira execução.

**Detalhes**:
```
CTU (Counter Up) - should create counter on first execution
- Expected: accumulated = 0
- Received: accumulated = 1

CTD (Counter Down) - should create counter on first execution
- Expected: accumulated = 10
- Received: accumulated = 9
```

**Questão para Revisão**:
- O comportamento correto é contar na primeira execução quando há rising edge?
- Ou deveria esperar um ciclo completo (OFF -> ON) antes de contar?
- Verificar especificação IEC 61131-3 para contadores

**Impacto**:
- Afeta 11 testes diretamente
- Pode impactar comportamento de programas de usuário existentes

---

### 2. Timers (TON/TOFF) - Cálculo de Tempo Decorrido

**Arquivo**: `src/services/interpreter.ts`
**Testes Afetados**:
- `__tests__/unit/interpreter.timers.test.ts` - 5 testes falhando
- `__tests__/integration/examples.test.ts` - 8 testes (Timer e Blinker)
- `__tests__/integration/trafficLights.test.ts` - 5 testes
- `__tests__/integration/complexScenarios.test.ts` - múltiplos testes

**Problema**: Os timers não estão funcionando corretamente, especialmente:
1. TON não fica `done=true` após tempo decorrido
2. TOFF não fica `done=true` imediatamente quando habilitado
3. RST não reseta corretamente o timer

**Detalhes**:
```
TON - should be done after preset time elapses
- Expected: output Q0.0 = true
- Received: output Q0.0 = false

TOFF - should be done immediately when enabled
- Expected: output Q0.0 = true
- Received: output Q0.0 = false

RST - should reset timer when accumulator is TRUE
- Expected: timer.enabled = false
- Received: timer.enabled = true
```

**Questão para Revisão**:
- Como o tempo acumulado está sendo calculado?
- O `lastScanTime` está sendo atualizado corretamente?
- Verificar se a lógica de `done` bit está de acordo com IEC 61131-3

**Impacto**:
- Afeta ~30 testes
- Funcionalidade crítica - timers são fundamentais para PLCs
- Pode causar comportamento incorreto em programas reais

---

### 3. Reset de Contadores - previousEnable State

**Arquivo**: `src/services/interpreter.ts`
**Testes Afetados**:
- `__tests__/unit/interpreter.counters.test.ts:385`

**Problema**: Após resetar um contador com CTR, o `previousEnable` não está sendo resetado corretamente.

**Detalhes**:
```
should handle previousEnable correctly across reset
- Expected: accumulated = 0 após reset
- Received: accumulated = 1 (contou novamente)
```

**Questão para Revisão**:
- O CTR deve resetar apenas o `accumulated` ou também o `previousEnable`?
- Verificar se após reset, um sinal que já estava HIGH deve contar novamente ou não

**Impacto**:
- Pode causar contagem incorreta após reset
- Comportamento pode ser surpreendente para usuários

---

## 🟡 Prioridade Média - Problemas de Componentes React

### 4. BatchScene - Seletores de Elemento

**Arquivo**: `src/components/BatchScene/BatchScene.tsx`
**Testes Afetados**: 30 testes

**Problema**: Os testes não conseguem encontrar elementos esperados. Possíveis causas:
- Mudanças na estrutura HTML do componente
- Textos traduzidos diferentes do esperado pelos testes
- Atributos `data-testid` faltando ou incorretos

**Exemplos de Falhas**:
- "should render control panel" - não encontra o elemento
- "should render START button" - não encontra o botão
- "should use I0.0 for START button" - mapeamento incorreto

**Ação Recomendada**:
1. Revisar se o componente BatchScene ainda renderiza os elementos esperados
2. Verificar se as traduções i18n estão corretas
3. Adicionar/corrigir atributos `data-testid` se necessário
4. Considerar usar mais `data-testid` e menos seletores baseados em texto

---

### 5. DefaultScene - Estrutura de Renderização

**Arquivo**: `src/components/DefaultScene/DefaultScene.tsx`
**Testes Afetados**: 10 testes

**Problema Similar ao BatchScene**:
- Elementos não encontrados (título, inputs, outputs)
- Possível mudança na estrutura do componente

**Ação Recomendada**:
- Revisar estrutura HTML do componente
- Atualizar testes para refletir implementação atual
- Adicionar `data-testid` para estabilidade dos testes

---

### 6. TrafficLightScene - Seletores de Texto Traduzido

**Arquivo**: `src/components/TrafficLightScene/TrafficLightScene.tsx`
**Testes Afetados**: 3 testes

**Problema**:
```
Error: Unable to find element with text: Norte-Sul (N-S)
Found multiple elements with that text
```

**Questão**:
- Há elementos duplicados sendo renderizados?
- Os textos estão sendo traduzidos de forma diferente?

**Ação Recomendada**:
- Usar seletores mais específicos (data-testid)
- Verificar se há duplicação de elementos

---

### 7. HelpDialog e MenuBar - Seletores de UI

**Arquivos**:
- `src/components/HelpDialog/HelpDialog.tsx` (5 testes falhando)
- `src/components/MenuBar/MenuBar.tsx` (6 testes falhando)

**Problema**: Elementos não encontrados, callbacks não sendo chamados

**Ação Recomendada**:
- Revisar estrutura dos componentes
- Verificar se eventos estão sendo propagados corretamente
- Atualizar testes para refletir implementação atual

---

### 8. CodeEditor - Atributo spellCheck

**Arquivo**: `src/components/CodeEditor/CodeEditor.tsx`
**Teste**: "should have spellCheck disabled"

**Problema**: Esperado `spellcheck="false"`, mas não está presente

**Ação**: Simples - adicionar `spellCheck={false}` ao elemento textarea/input

---

## 📊 Estatísticas por Categoria

| Categoria | Testes Falhando | Prioridade |
|-----------|-----------------|------------|
| Counter Logic | 11 | 🔴 Alta |
| Timer Logic | 30+ | 🔴 Alta |
| BatchScene UI | 30 | 🟡 Média |
| DefaultScene UI | 10 | 🟡 Média |
| TrafficLightScene UI | 3 | 🟡 Média |
| HelpDialog UI | 5 | 🟡 Média |
| MenuBar UI | 6 | 🟡 Média |
| CodeEditor | 1 | 🟢 Baixa |

---

## 🎯 Recomendações de Ação

### Imediato (Prioridade Alta)
1. **Revisar lógica de Counters** - Verificar comportamento de rising edge na primeira execução
2. **Revisar lógica de Timers** - Verificar cálculo de tempo e done bit
3. **Testar manualmente** - Criar programas simples no simulador para validar comportamento

### Curto Prazo (Prioridade Média)
4. **Adicionar data-testid** - Tornar testes de UI mais estáveis
5. **Atualizar testes de componentes** - Refletir implementação atual
6. **Corrigir spellCheck** - Fix simples no CodeEditor

### Longo Prazo
7. **Documentar comportamento esperado** - Criar specs claras para Counters/Timers
8. **Adicionar testes de integração** - Validar comportamento real do simulador
9. **Revisar conformidade IEC 61131-3** - Garantir que implementação segue padrão

---

## 📝 Notas Adicionais

- Os testes de lógica (Counters/Timers) são mais críticos que os de UI
- Problemas de UI podem ser apenas testes desatualizados
- Problemas de lógica podem afetar programas de usuário reais
- Recomendo começar pela revisão de Timers (maior impacto)

---

## ✅ Progresso

- [x] Corrigidos mocks de react-i18next (ExamplesMenu e MainWindow)
- [x] Documentação de problemas criada
- [ ] Revisão de lógica de Counters
- [ ] Revisão de lógica de Timers
- [ ] Atualização de testes de UI
- [ ] Correções de bugs identificados

---

**Próximos Passos Sugeridos**:
1. Executar simulador manualmente para validar comportamento de Timers
2. Comparar comportamento com especificação IEC 61131-3
3. Decidir se testes estão corretos ou se código precisa ser corrigido
4. Aplicar correções e re-executar testes
