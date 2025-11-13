# Ideias Futuras para Exemplos de Traffic Light

## Botão de Pedestre (Pedestrian Crossing)

Agora que os semáforos funcionam automaticamente sem necessidade de botões para iniciar, as entradas **I0.0** e **I0.1** podem ser reaproveitadas para novos exercícios educacionais.

### Conceito: Botão de Solicitação de Passagem

Simular um **botão de pedestre** que, quando pressionado, altera o ciclo normal do semáforo para permitir a travessia segura de pedestres.

#### Exemplo 1: Semáforo com Botão de Pedestre (Single Light)
```
Funcionalidade:
- O semáforo opera normalmente no ciclo Red → Green → Yellow
- Quando I0.0 é pressionado (botão de pedestre):
  - Se o semáforo está verde: muda para amarelo e depois vermelho
  - Se já está vermelho: mantém mais tempo no vermelho
  - Acende Q0.3 (luz de "WALK" para pedestre) por 10 segundos
  - Retorna ao ciclo normal após liberar os pedestres
```

#### Exemplo 2: Cruzamento com Botões de Pedestre (2 Lights)
```
Funcionalidade:
- Dois semáforos operando de forma sincronizada/independente
- I0.0 = Botão de pedestre Norte-Sul
- I0.1 = Botão de pedestre Leste-Oeste
- Quando pressionado:
  - Interrompe o ciclo normal
  - Coloca ambas direções em vermelho (all-red phase)
  - Ativa sinal de "WALK" (Q0.3 ou Q1.3)
  - Aguarda tempo de travessia (15 segundos)
  - Retorna ao ciclo normal
```

#### Exemplo 3: Botão de Emergência
```
Funcionalidade:
- I0.0 = Botão de emergência (ambulância, bombeiros)
- Quando pressionado:
  - Força semáforo a ficar verde na direção de emergência
  - Outros semáforos ficam vermelhos
  - Q0.4 = Luz de advertência piscando (emergency mode)
  - Ao soltar I0.0, retorna gradualmente ao ciclo normal
```

## Implementação Sugerida

### Estrutura de Código

```il
// Ciclo Normal (sem botão pressionado)
LDN I0.0  // Se botão NÃO pressionado
ANDN M0   // E não está em modo pedestre
// ... lógica normal do semáforo

// Modo Pedestre (botão pressionado)
LD I0.0   // Se botão pressionado
ST M0     // Ativa flag de modo pedestre
// ... força semáforo vermelho
// ... ativa luz WALK
// ... temporizador para travessia

// Retorno ao Normal
LD M0
AND T10   // Após tempo de travessia
RST M0    // Desativa modo pedestre
```

### Outputs Sugeridos

- **Q0.0-Q0.2**: Semáforo 1 (Red, Yellow, Green)
- **Q0.3**: Sinal "WALK" para pedestre 1
- **Q0.4**: Luz de emergência/advertência
- **Q1.0-Q1.2**: Semáforo 2 (Red, Yellow, Green)
- **Q1.3**: Sinal "WALK" para pedestre 2

### Variáveis de Memória

- **M0**: Flag de modo pedestre ativo (direção 1)
- **M1**: Flag de modo pedestre ativo (direção 2)
- **M2**: Flag de emergência ativa
- **M3**: Flag de retorno ao ciclo normal

### Temporizadores Adicionais

- **T10**: Tempo de travessia de pedestre (15s = 150)
- **T11**: Delay de segurança all-red phase (3s = 30)
- **T12**: Pisca da luz de emergência (5s = 5)

## Conceitos Educacionais

Esses exemplos ensinam:

1. **Priorização de eventos**: Como lidar com interrupções no ciclo normal
2. **Segurança**: Implementar "all-red phase" antes de liberar pedestres
3. **Estados de máquina**: Normal → Pedestre → Retorno
4. **Flags de controle**: Uso de bits de memória (M) para controlar estados
5. **Debouncing**: Evitar múltiplas ativações do botão
6. **Sistemas de emergência**: Prioridade máxima vs ciclo normal

## Visualização no Simulador

Para melhor experiência, seria ideal adicionar:

- Botões visuais I0.0 e I0.1 nas cenas de Traffic Light
- Indicador "WALK" quando Q0.3/Q1.3 ativo
- Ícone de pedestre animado atravessando
- Luz de emergência piscando quando ativa

## Arquivos Propostos

1. `15_traffic_light_pedestrian_single.txt` - Semáforo simples com botão de pedestre
2. `16_traffic_light_pedestrian_crossroad.txt` - Cruzamento com 2 botões de pedestre
3. `17_traffic_light_emergency.txt` - Sistema com botão de emergência
4. `18_traffic_light_complete.txt` - Sistema completo com pedestre + emergência

---

**Nota**: Estas são sugestões para expansão futura do simulador. A implementação requer:
- Atualização dos exemplos com a lógica IL
- Possível adição de novos outputs (Q0.3, Q0.4, etc.)
- Melhorias na visualização das cenas Traffic Light
- Documentação adicional sobre o comportamento esperado
