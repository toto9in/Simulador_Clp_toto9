package screens.scenes;

import javax.swing.*;

import ilcompiler.input.Input.InputType;

import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.Objects;

public class PushButton extends JPanel {

    public enum ButtonPalette {
        GRAY(new Color(200, 200, 200), new Color(150, 150, 150), new Color(100, 100, 100), new Color(80, 80, 80)),
        RED(new Color(255, 138, 128), new Color(229, 57, 53), new Color(183, 28, 28), new Color(127, 0, 0));

        public final Color normal;
        public final Color pressed;
        public final Color border;
        public final Color innerPressed;

        ButtonPalette(Color normal, Color pressed, Color border, Color innerPressed) {
            this.normal = normal;
            this.pressed = pressed;
            this.border = border;
            this.innerPressed = innerPressed;
        }
    }

    private boolean isPressed = false;
    private final String inputKey;
    private InputEventListener inputListener;
    private Color normalColor;
    private Color pressedColor;
    private Color borderColor;
    private Color innerPressedColor;
    private final InputType type;

    public PushButton(String inputKey) {
        this(inputKey, InputType.NO, ButtonPalette.GRAY);
    }

    public PushButton(String inputKey, InputType type) {
        this(inputKey, type, ButtonPalette.GRAY);
    }

    public PushButton(String inputKey, InputType type, ButtonPalette colorSet) {
        this.inputKey = Objects.requireNonNull(inputKey, "inputKey must not be null");
        this.type = Objects.requireNonNull(type, "mode must not be null");
        setColorSet(colorSet);
        setOpaque(false);
        setPreferredSize(new Dimension(120, 50));

        addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                if (inputListener == null || e.getButton() != MouseEvent.BUTTON1) {
                    return;
                }

                isPressed = true;
                repaint();

                inputListener.onPressed(inputKey, e);
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                if (inputListener == null || e.getButton() != MouseEvent.BUTTON1) {
                    return;
                }

                isPressed = false;
                repaint();

                inputListener.onReleased(inputKey, e);
            }
        });
    }

    public void setColorSet(ButtonPalette colorSet) {
        this.normalColor = colorSet.normal;
        this.pressedColor = colorSet.pressed;
        this.borderColor = colorSet.border;
        this.innerPressedColor = colorSet.innerPressed;
        repaint();
    }

    public void setInputEventListener(InputEventListener listener) {
        this.inputListener = listener;
    }

    public String getInputKey() {
        return inputKey;
    }

    public InputType getType() {
        return type;
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        int buttonSize = 25;

        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int centerY = getHeight() / 2;
        int buttonX = 10;
        int buttonY = centerY - buttonSize / 2;

        boolean visuallyPressed = (type == InputType.NO && isPressed)
                || (type == InputType.NC && !isPressed);

        g2.setColor(visuallyPressed ? pressedColor : normalColor);
        g2.fillOval(buttonX, buttonY, buttonSize, buttonSize);

        if (visuallyPressed || type == InputType.NO) {
            g2.setColor(borderColor);
            g2.setStroke(new BasicStroke(2f));
            g2.drawOval(buttonX, buttonY, buttonSize, buttonSize);
        }

        if (visuallyPressed) {
            int inset = 2;
            g2.setColor(innerPressedColor);
            g2.fillOval(buttonX + inset, buttonY + inset, buttonSize - inset * 2, buttonSize - inset * 2);
        }

        g2.dispose();
    }
}
