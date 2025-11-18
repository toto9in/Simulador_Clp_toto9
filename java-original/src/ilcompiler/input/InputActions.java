package ilcompiler.input;

import java.util.*;

import ilcompiler.input.Input.InputType;

public class InputActions {

    private static final List<String> INPUT_IDS = new ArrayList<>();

    static {
        for (int i = 0; i <= 7; i++) {
            INPUT_IDS.add("I0." + i);
        }
        for (int i = 0; i <= 7; i++) {
            INPUT_IDS.add("I1." + i);
        }
    }

    public static Map<String, Boolean> create(Map<String, Boolean> inputs) {
        for (String id : INPUT_IDS) {
            Input input = new Input(id, false);
            inputs.put(input.id, input.currentValue);
        }
        return inputs;
    }

    public static Map<String, InputType> createType(Map<String, InputType> inputsType) {
        for (String id : INPUT_IDS) {
            inputsType.put(id, InputType.SWITCH);
        }
        return inputsType;
    }

    public static Map<String, Boolean> read(Map<String, Boolean> inputs) {
        return inputs;
    }
}
