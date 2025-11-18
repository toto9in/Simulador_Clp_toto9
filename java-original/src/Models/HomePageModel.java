package Models;

import ilcompiler.input.Input.InputType;
import ilcompiler.memoryvariable.MemoryVariable;
import java.util.HashMap;
import java.util.Map;

public class HomePageModel {

    private static Map<String, InputType> inputsType = new HashMap<>();
    private static Map<String, Boolean> inputs = new HashMap<>();
    private static Map<String, Boolean> outputs = new HashMap<>();
    private static Map<String, MemoryVariable> memoryVariables = new HashMap<>();
    private static ExecutionMode mode = ExecutionMode.IDLE;
    private static Integer color = 1;

    public static Map<String, InputType> getInputsType() {
        return inputsType;
    }

    public static void setInputsType(Map<String, InputType> map) {
        inputsType = map;
    }

    public static Map<String, Boolean> getInputs() {
        return inputs;
    }

    public static void setInputs(Map<String, Boolean> map) {
        inputs = map;
    }

    public static Map<String, Boolean> getOutputs() {
        return outputs;
    }

    public static void setOutputs(Map<String, Boolean> map) {
        outputs = map;
    }

    public static Map<String, MemoryVariable> getMemoryVariables() {
        return memoryVariables;
    }

    public static void setMemoryVariables(Map<String, MemoryVariable> map) {
        memoryVariables = map;
    }

    public static Integer getColor() {
        return color;
    }

    public static void setColor(Integer newColor) {
        color = newColor;
    }

    public static void setMode(ExecutionMode newMode) {
        mode = newMode;
    }

    public static ExecutionMode getMode() {
        return mode;
    }

    public static boolean isRunning() {
        return mode == ExecutionMode.RUNNING;
    }

    public static boolean isStopped() {
        return mode == ExecutionMode.STOPPED;
    }

    public static boolean isIdle() {
        return mode == ExecutionMode.IDLE;
    }
}
