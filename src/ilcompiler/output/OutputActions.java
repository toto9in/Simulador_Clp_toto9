package ilcompiler.output;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Classe para as ações relacionadas com as saídas
public class OutputActions {

    private static final List<String> OUTPUT_IDS = new ArrayList<>();

    static {
        for (int i = 0; i <= 7; i++) {
            OUTPUT_IDS.add("Q1." + i);
        }
        for (int i = 0; i <= 7; i++) {
            OUTPUT_IDS.add("Q0." + i);
        }
    }

    public static Map<String, Boolean> create(Map<String, Boolean> outputs) {
        for (String id : OUTPUT_IDS) {
            Output output = new Output(id, false);
            outputs.put(output.id, output.currentValue);
        }
        return outputs;
    }

    public static Map<String, Boolean> resetOutputs(Map<String, Boolean> outputs) {
        for (String id : OUTPUT_IDS) {
            outputs.put(id, false);
        }
        return outputs;
    }
}
