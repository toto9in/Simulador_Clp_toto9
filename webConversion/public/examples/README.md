# Example IL Programs

This directory contains example Instruction List (IL) programs demonstrating all features of the PLC Simulator.

## Examples

### 1. Basic Logic Operations (`01-basic-logic.txt`)

Demonstrates fundamental logical operations:
- **LD/ST**: Load and Store operations
- **AND**: Logical AND operation
- **OR**: Logical OR operation
- **ANDN**: AND with negated operand
- **ORN**: OR with negated operand
- **LDN**: Load negated value

**How to use:**
1. Load this program
2. Toggle inputs I0.0 through I0.7
3. Observe outputs Q0.0 through Q0.5 responding to logic

**Expected behavior:**
- Q0.0 = I0.0 AND I0.1
- Q0.1 = I0.2 OR I0.3
- Q0.2 = I0.4 AND NOT(I0.5)
- Q0.3 = I0.6 OR NOT(I0.7)
- Q0.4 = NOT(I0.0) AND I0.1
- Q0.5 = I0.2 AND NOT(I0.3) OR NOT(I0.4)

---

### 2. Timer Operations (`02-timers.txt`)

Demonstrates timer functionality with 100ms time base:
- **TON**: Timer On-Delay (activates after preset time)
- **TOFF**: Timer Off-Delay (deactivates after preset time)

**Timers in this example:**
- T0: 5.0 seconds (50 × 100ms)
- T1: 3.0 seconds (30 × 100ms)
- T2: 2.0 seconds (20 × 100ms) - OFF delay
- T3: 10.0 seconds (100 × 100ms)
- T4: 1.0 second (10 × 100ms)
- T5: 2.5 seconds (25 × 100ms) - OFF delay

**How to use:**
1. Load this program
2. Set mode to RUN
3. Activate inputs I0.0 through I0.7
4. Watch outputs activate after timer preset times
5. Use Data Table to monitor timer accumulated values

**Expected behavior:**
- TON: Output activates AFTER input has been ON for preset time
- TOFF: Output deactivates AFTER input has been OFF for preset time

---

### 3. Counter Operations (`03-counters.txt`)

Demonstrates counter functionality:
- **CTU**: Count Up (increments on rising edge)
- **CTD**: Count Down (decrements on rising edge)

**Counters in this example:**
- C0: Count up to 5
- C1: Count up to 10
- C2: Count down from 3
- C3: Count up to 20
- C4: Count up to 8
- C5: Count down from 15

**How to use:**
1. Load this program
2. Set mode to RUN
3. Toggle inputs I0.0 through I0.7 repeatedly
4. Each rising edge (OFF→ON) increments/decrements the counter
5. Use Data Table to monitor counter accumulated values

**Expected behavior:**
- CTU: Output activates when count >= preset
- CTD: Output activates when count <= 0
- Rising edge detection: counter only changes on OFF→ON transition

---

### 4. Batch Simulation (`04-batch-simulation.txt`)

Demonstrates a simple tank filling control system:
- Fill valve control (Q0.0)
- Drain valve control (Q0.1)
- Critical level alarm (Q0.2)
- Safety interlocks using memory variables (M0, M1, M2)

**Inputs:**
- I0.0: Start Fill button
- I0.1: Start Drain button
- I1.0: Low level sensor
- I1.1: Mid level sensor
- I1.2: High level sensor
- I1.3: Critical level sensor

**Outputs:**
- Q0.0: Fill valve (open when ON)
- Q0.1: Drain valve (open when ON)
- Q0.2: Critical alarm

**How to use:**
1. Load this program
2. Switch to Batch Simulation scene
3. Set mode to RUN
4. Click "Start Fill" or "Start Drain" buttons
5. Watch tank level and sensor activation

**Expected behavior:**
- Fill valve opens when Start Fill pressed AND not at critical level
- Drain valve opens when Start Drain pressed AND tank is high
- Critical alarm activates if level reaches maximum
- Safety interlocks prevent overflow

---

## Loading Examples

### Via UI (when implemented):
1. Click Menu → File → Open
2. Navigate to `public/examples/`
3. Select desired example file
4. Click Open

### Via File System:
1. Copy the example program text
2. Paste into Code Editor
3. Set mode to RUN

---

## Creating Your Own Programs

### Instruction Format

```
OPERATOR OPERAND1, OPERAND2
```

### Available Instructions

| Instruction | Description | Example |
|-------------|-------------|---------|
| `LD` | Load value to accumulator | `LD I0.0` |
| `LDN` | Load negated value | `LDN I0.1` |
| `ST` | Store accumulator | `ST Q0.0` |
| `STN` | Store negated | `STN Q0.1` |
| `AND` | Logical AND | `AND I0.2` |
| `ANDN` | AND NOT | `ANDN I0.3` |
| `OR` | Logical OR | `OR I0.4` |
| `ORN` | OR NOT | `ORN I0.5` |
| `TON` | Timer On-Delay | `TON T0, 50` |
| `TOFF` | Timer Off-Delay | `TOFF T1, 30` |
| `CTU` | Count Up | `CTU C0, 10` |
| `CTD` | Count Down | `CTD C1, 5` |

### Variable Ranges

- **Inputs**: I0.0 to I1.7 (16 inputs)
- **Outputs**: Q0.0 to Q1.7 (16 outputs)
- **Memory**: M0 to M99 (boolean memory)
- **Timers**: T0 to T99 (time base = 100ms)
- **Counters**: C0 to C99 (integer counters)

---

## Tips

1. **Always start with LD or LDN** to load a value into the accumulator
2. **Use ST or STN** to store the result
3. **Timer preset is in 100ms units** (50 = 5.0 seconds)
4. **Counters increment on rising edge** (OFF→ON transition)
5. **Use Data Table** to monitor all variables in real-time
6. **Test incrementally** - start simple, add complexity gradually

---

## Troubleshooting

### Program doesn't run
- Check if mode is set to RUN (not PROGRAM or STOP)
- Verify syntax is correct
- Check for empty lines or invalid instructions

### Outputs don't respond
- Verify inputs are being toggled
- Check logic in program
- Use Data Table to inspect accumulator value

### Timers don't work
- Ensure mode is RUN (timers only run in RUN mode)
- Verify preset value is reasonable
- Check if input is staying ON long enough

### Counters don't increment
- Ensure you're creating rising edges (OFF→ON)
- Verify counter hasn't reached preset yet
- Check Data Table for actual count value

---

**For more information, see the main README.md**
