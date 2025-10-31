package screens.scenes;

import java.awt.event.MouseEvent;

public interface InputEventListener {
    void onPressed(String inputKey, MouseEvent evt);
    void onReleased(String inputKey, MouseEvent evt); 
}
