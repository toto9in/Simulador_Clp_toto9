package screens.scenes;

import ilcompiler.input.Input.InputType;
import java.util.Map;

public interface IScenePanel {

    public void initInputs(Map<String, InputType> inputsType, Map<String, Boolean> inputs);

    public void updateUIState(Map<String, InputType> inputsType, Map<String, Boolean> inputs,
            Map<String, Boolean> outputs);

    public void resetUIState();

    public void setInputListener(InputEventListener listener);

    public void setOnCriticalFailureCallback(Runnable callback);

    public void stop();
}