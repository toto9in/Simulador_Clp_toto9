package screens.scenes;

import javax.swing.*;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;

public class RedIndicator extends JComponent {

    private final Color activeFill = new Color(200, 0, 0);
    private final Color inactiveFill = Color.BLACK;
    private final Color borderColor = new Color(150, 150, 150);
    private final IndicatorType type;

    private final int size;
    private boolean active = false;

    private final String key;

    public enum IndicatorType {
        SENSOR,
        LED
    }

    public RedIndicator(String key) {
        this(key, IndicatorType.SENSOR);
    }

    public RedIndicator(String key, IndicatorType type) {
        this.key = key;
        this.type = type;
        this.size = type == IndicatorType.LED ? 20 : 10;

        setPreferredSize(new Dimension(size, size));
        setOpaque(false);
    }

    public String getKey() {
        return key;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g2.setColor(active ? activeFill : inactiveFill);
        g2.setStroke(new BasicStroke(2f));

        switch (type) {
            case LED -> {
                g2.fillOval(0, 0, size, size);
                g2.setColor(borderColor);
                g2.drawOval(0, 0, size, size);
            }
            case SENSOR -> {
                Shape shape = new RoundRectangle2D.Float(0, 0, size, size, size * 0.3f, size * 0.3f);
                g2.fill(shape);
                g2.setColor(borderColor);
                g2.draw(shape);
            }
        }

        g2.dispose();
    }

}
