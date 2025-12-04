# Simulação Batch - Guia de Uso

## Visão Geral

A simulação batch representa um tanque industrial com controle de enchimento, mistura e drenagem.

## Mapeamento de I/O

### Entradas (Inputs)

| Endereço | Descrição | Tipo | Função |
|----------|-----------|------|---------|
| **I0.0** | START | Botão NA (Normally Open) | Inicia o ciclo de enchimento |
| **I0.1** | STOP | Botão NF (Normally Closed) | Para o sistema e inicia drenagem |
| **I1.0** | HI-LEVEL | Sensor | Ativa quando tanque >= 100% |
| **I1.1** | LO-LEVEL | Sensor | Ativa quando tanque > 1% |

### Saídas (Outputs)

| Endereço | Descrição | Função |
|----------|-----------|---------|
| **Q0.1** | PUMP1 | Válvula de enchimento (fill valve) |
| **Q0.2** | MIXER | Motor do misturador |
| **Q0.3** | PUMP3 | Válvula de drenagem (drain valve) |
| **Q1.0** | RUN LED | LED indicador de sistema em operação |
| **Q1.1** | IDLE LED | LED indicador de sistema ocioso |
| **Q1.2** | FULL LED | LED indicador de tanque cheio |

## Lógica de Funcionamento

### 1. Ciclo de Enchimento (FILL)
```
LD I0.0        // Botão START pressionado
OR Q0.1        // OU bomba já está ligada (seal-in)
ANDN I0.1      // E botão STOP não está pressionado
ANDN I1.0      // E tanque não está cheio
ST Q0.1        // Liga PUMP1 (enchimento)
```

**Comportamento:**
- Pressione I0.0 (START) para iniciar o enchimento
- A bomba permanece ligada (seal-in) até:
  - Tanque atingir 100% (I1.0 = ON)
  - Botão STOP ser pressionado (I0.1 = ON)
- Taxa de enchimento: ~2% por ciclo

### 2. Misturador (MIXER)
```
LD I0.0        // START pressionado
AND I1.0       // E tanque está cheio
ST Q0.2        // Liga MIXER
```

**Comportamento:**
- Liga automaticamente quando tanque atinge 100%
- Requer que START esteja pressionado
- Para quando START é liberado

### 3. Ciclo de Drenagem (DRAIN)
```
LD I0.1        // Botão STOP pressionado
OR Q0.3        // OU bomba de drenagem já está ligada
AND I1.1       // E tanque tem líquido
ST Q0.3        // Liga PUMP3 (drenagem)
```

**Comportamento:**
- Pressione I0.1 (STOP) para iniciar drenagem
- Para automaticamente quando tanque esvaziar (I1.1 = OFF)
- Taxa de drenagem: ~1.5% por ciclo

### 4. LEDs Indicadores
```
// RUN LED - Sistema operando
LD Q0.1        // PUMP1 ligada
OR Q0.2        // OU MIXER ligado
OR Q0.3        // OU PUMP3 ligada
ST Q1.0        // Acende LED RUN

// IDLE LED - Sistema ocioso
LDN Q1.0       // Nenhum equipamento ligado
ST Q1.1        // Acende LED IDLE

// FULL LED - Tanque cheio
LD I1.0        // Sensor HI-LEVEL ativo
ST Q1.2        // Acende LED FULL
```

## Sequência de Operação

### Operação Normal

1. **Iniciar Enchimento:**
   - Pressione I0.0 (START)
   - PUMP1 (Q0.1) liga
   - RUN LED (Q1.0) acende
   - Tanque começa a encher

2. **Tanque Enchendo:**
   - Nível sobe de 0% → 100%
   - Quando atinge 100%:
     - I1.0 (HI-LEVEL) ativa
     - PUMP1 para automaticamente
     - MIXER (Q0.2) liga
     - FULL LED (Q1.2) acende

3. **Mistura:**
   - MIXER fica ligado enquanto START estiver pressionado
   - Libere I0.0 para parar o mixer

4. **Drenagem:**
   - Pressione I0.1 (STOP)
   - PUMP3 (Q0.3) liga
   - Tanque começa a drenar
   - Quando atinge 1%:
     - I1.1 (LO-LEVEL) desativa
     - PUMP3 para automaticamente
   - IDLE LED (Q1.1) acende

### Operação de Emergência

**Parada de Emergência:**
- Pressione I0.1 (STOP) a qualquer momento
- PUMP1 e MIXER param imediatamente
- PUMP3 liga para drenar o tanque

## Sensores

### I1.0 - HI-LEVEL Sensor
- **ON (1)**: Tanque >= 100%
- **OFF (0)**: Tanque < 100%
- Usado para:
  - Parar enchimento
  - Iniciar mixer
  - Indicar tanque cheio

### I1.1 - LO-LEVEL Sensor
- **ON (1)**: Tanque > 1%
- **OFF (0)**: Tanque <= 1%
- Usado para:
  - Permitir drenagem
  - Detectar tanque vazio

## Tempos de Operação

Com as taxas configuradas:
- **Enchimento completo**: ~50 ciclos (~5 segundos @ 100ms/ciclo)
- **Drenagem completa**: ~67 ciclos (~6.7 segundos @ 100ms/ciclo)

## Testando a Simulação

### Teste 1: Enchimento Simples
1. Carregue o exemplo "Batch Process - Automatic"
2. Pressione RUN
3. Clique em I0.0 (START)
4. Observe o tanque enchendo
5. Q0.1 deve ligar (PUMP1)
6. Quando cheio: I1.0 liga, Q0.1 desliga, Q0.2 liga

### Teste 2: Ciclo Completo
1. Pressione I0.0 (START) → Enchimento
2. Aguarde tanque encher → Mixer liga
3. Pressione I0.1 (STOP) → Drenagem
4. Aguarde tanque esvaziar → Sistema volta para IDLE

### Teste 3: Parada de Emergência
1. Inicie enchimento (I0.0)
2. No meio do processo, pressione I0.1 (STOP)
3. Enchimento para imediatamente
4. Drenagem inicia

## Troubleshooting

### Problema: Tanque não enche
- Verifique se I0.0 está pressionado
- Verifique se I0.1 NÃO está pressionado
- Verifique se I1.0 não está ativo (tanque não está cheio)

### Problema: Mixer não liga
- Verifique se tanque está em 100% (I1.0 = ON)
- Verifique se I0.0 ainda está pressionado

### Problema: Drenagem não para
- Verifique se I1.1 desativou quando tanque esvaziar
- Sensor LO-LEVEL desativa em 1%

### Problema: LEDs não acendem
- RUN LED: Deve acender quando qualquer bomba/mixer estiver ON
- IDLE LED: Só acende quando todas saídas estão OFF
- FULL LED: Só acende quando I1.0 = ON

## Melhorias Possíveis

Para exercício, considere adicionar:

1. **Timer de Mistura:**
   ```
   LD I0.0
   AND I1.0
   TON T0,50      // Mix por 5 segundos
   LD T0
   ST Q0.2
   ```

2. **Contador de Ciclos:**
   ```
   LD I1.0        // Detecta tanque cheio
   CTU C0,10      // Conta 10 ciclos
   ```

3. **Alarme de Overflow:**
   ```
   LD I1.0
   AND Q0.1       // Tanque cheio MAS bomba ainda ligada
   ST Q0.4        // Alarme
   ```

4. **Modo Automático Contínuo:**
   - Encher → Misturar → Drenar → Repetir
   - Sem intervenção manual
