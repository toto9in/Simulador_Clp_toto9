# Exemplos de Simulação Batch

## Mapeamento de I/O

### Entradas (Inputs)
- **I0.0** - Botão START (pressione para iniciar)
- **I0.1** - Botão STOP (pressione para parar)
- **I1.0** - Sensor HI-LEVEL (ativa automaticamente quando tanque >= 100%)
- **I1.1** - Sensor LO-LEVEL (ativa automaticamente quando tanque > 1%)

### Saídas (Outputs)
- **Q0.1** - PUMP1 (bomba de enchimento - enche o tanque)
- **Q0.2** - MIXER (misturador)
- **Q0.3** - PUMP3 (bomba de drenagem - esvazia o tanque)
- **Q1.0** - LED RUN (indica sistema em execução)
- **Q1.1** - LED IDLE (indica sistema parado)
- **Q1.2** - LED FULL (indica tanque cheio)

---

## Exemplo 1: Batch - Simples

**Arquivo:** `04-batch-simulation.txt` ou `Batch - Simples.txt`

### Como funciona:
1. Pressione **START (I0.0)** para ligar a bomba de enchimento
2. A bomba **PUMP1 (Q0.1)** liga e enche o tanque
3. Quando o tanque atinge 100%, o sensor **HI-LEVEL (I1.0)** ativa
4. A bomba para automaticamente ao atingir o nível alto
5. O **MIXER (Q0.2)** liga quando o tanque está cheio
6. Pressione **STOP (I0.1)** para ativar a drenagem
7. A bomba **PUMP3 (Q0.3)** liga e esvazia o tanque
8. Quando o tanque esvazia (< 1%), o sensor **LO-LEVEL (I1.1)** desliga

### Código explicado:
```
LD I0.0          ; Carrega botão START
OR Q0.1          ; OU bomba já ligada (selo)
ANDN I0.1        ; E não pressionou STOP
ANDN I1.0        ; E não está no nível alto
ST Q0.1          ; Liga PUMP1 (enchimento)

LD I0.0          ; Carrega botão START
AND I1.0         ; E tanque cheio
ST Q0.2          ; Liga MIXER

LD I0.1          ; Carrega botão STOP
OR Q0.3          ; OU bomba de drenagem já ligada
AND I1.1         ; E tem líquido no tanque
ST Q0.3          ; Liga PUMP3 (drenagem)

LD Q0.1          ; Verifica se alguma bomba
OR Q0.2          ; ou mixer
OR Q0.3          ; ou drenagem está ligada
ST Q1.0          ; Liga LED RUN

LDN Q1.0         ; Inverte LED RUN
ST Q1.1          ; Liga LED IDLE quando parado

LD I1.0          ; Carrega sensor de nível alto
ST Q1.2          ; Liga LED FULL
```

### Passos para testar:
1. Selecione a cena "Batch Simulation" no menu
2. Carregue o código no editor IL
3. Clique em **Run** (▶) no menu
4. Clique no botão **START (I0.0)** na interface
5. Observe o tanque enchendo com líquido amarelo
6. Quando chegar a 100%, clique em **STOP (I0.1)**
7. Observe o tanque esvaziando

---

## Exemplo 2: Batch - Ciclo Automático

**Arquivo:** `Batch - Ciclo Automatico.txt`

### Como funciona:
Este exemplo é mais avançado e usa **timers** para criar um ciclo automático completo:

1. Pressione **START** uma vez
2. O sistema faz automaticamente:
   - Enche o tanque (PUMP1)
   - Liga o mixer por 3 segundos quando cheio
   - Esvazia o tanque (PUMP3)
   - Espera 5 segundos
   - Repete o ciclo

### Lógica do programa:
- **T0** = Timer de 3 segundos (30 × 100ms) para o mixer
- **T1** = Timer de 5 segundos (50 × 100ms) para pausa entre ciclos
- **M0** = Memória que detecta quando tanque encheu completamente
- **M1** = Memória que detecta quando tanque esvaziou completamente

### Proteções de segurança:
- ⚠️ PUMP1 não liga se o tanque já está cheio (I1.0)
- ⚠️ PUMP3 não liga se o tanque está vazio (I1.1 desligado)
- ⚠️ STOP interrompe todo o ciclo imediatamente

---

## Dicas:

- **LED RUN (Q1.0)** acende quando qualquer bomba ou mixer está ligado
- **LED IDLE (Q1.1)** acende quando o sistema está parado
- **LED FULL (Q1.2)** acende quando o sensor HI-LEVEL detecta tanque cheio

## Solução de problemas:

**Tanque não enche:**
- Verifique se pressionou START (I0.0)
- Verifique se o programa está em modo RUN (▶)
- Verifique se Q0.1 está ligado na interface

**Tanque não esvazia:**
- Pressione STOP (I0.1) depois que o tanque encher
- Verifique se Q0.3 está ligado na interface

**Programa para com erro:**
- Certifique-se de que não há erros de sintaxe no código
- Verifique se todas as variáveis estão escritas corretamente (I1.0, Q0.1, etc.)
