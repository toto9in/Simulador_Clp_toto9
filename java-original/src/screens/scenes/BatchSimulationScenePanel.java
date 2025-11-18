package screens.scenes;

import Controllers.BatchSimulatorController;
import Models.HomePageModel;
import ilcompiler.input.Input.InputType;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.util.Map;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JPanel;

public class BatchSimulationScenePanel extends javax.swing.JPanel implements IScenePanel {

    private InputEventListener inputListener;

    private Runnable onCriticalFailureCallback;

    private final Image backgroundImage;

    private final BatchSimulatorController controller;
    private final BatchSimulatorController.FillHeight tankFillHeightWrapper;

    private final PushButton startBt, stopBt;
    private final PushButton[] buttons;

    private final RedIndicator runLed, idleLed, fullLed;
    private final RedIndicator pump1Indicator, pump3Indicator, mixerIndicator, hiLevelIndicator, loLevelIndicator;

    private final RedIndicator[] indicators;

    private Long hiLevelActivationTime = null;
    private boolean alertShown = false;

    private Long loLevelActivationTime = null;
    private boolean pump3AlertShown = false;

     private static final int timerForPumpsWarning = 1500;

    public BatchSimulationScenePanel() {
        backgroundImage = new ImageIcon(getClass().getResource("/Assets/batch_bg.png")).getImage();

        controller = new BatchSimulatorController(this);
        tankFillHeightWrapper = new BatchSimulatorController.FillHeight(0);

        startBt = new PushButton("I0.0", InputType.NO);
        stopBt = new PushButton("I0.1", InputType.NC, PushButton.ButtonPalette.RED);

        buttons = new PushButton[]{startBt, stopBt};

        runLed = new RedIndicator("Q1.0", RedIndicator.IndicatorType.LED);
        idleLed = new RedIndicator("Q1.1", RedIndicator.IndicatorType.LED);
        fullLed = new RedIndicator("Q1.2", RedIndicator.IndicatorType.LED);

        pump1Indicator = new RedIndicator("Q0.1");
        mixerIndicator = new RedIndicator("Q0.2");
        pump3Indicator = new RedIndicator("Q0.3");

        hiLevelIndicator = new RedIndicator("I1.0");
        loLevelIndicator = new RedIndicator("I1.1");

        indicators = new RedIndicator[]{runLed, idleLed, fullLed, pump1Indicator, pump3Indicator, mixerIndicator,
            hiLevelIndicator, loLevelIndicator};

        initComponents();
    }

    @Override
    public void setOnCriticalFailureCallback(Runnable callback) {
        this.onCriticalFailureCallback = callback;
    }

    @Override
    public void initInputs(Map<String, InputType> inputsType, Map<String, Boolean> inputs) {
        for (PushButton button : buttons) {
            var key = button.getInputKey();
            var type = button.getType();

            inputsType.put(key, type);
            inputs.put(key, type == InputType.NC);
        }
    }

    @Override
    public void updateUIState(Map<String, InputType> inputsType, Map<String, Boolean> inputs,
            Map<String, Boolean> outputs) {
        for (RedIndicator indicator : indicators) {
            String key = indicator.getKey();
            boolean updatedValue = false;

            if (key.startsWith("Q")) {
                updatedValue = outputs.getOrDefault(key, false);
            } else if (key.startsWith("I")) {
                updatedValue = inputs.getOrDefault(key, false);
            }

            indicator.setActive(updatedValue);
        }
        boolean isRunning = HomePageModel.isRunning();

        boolean pump1On = outputs.getOrDefault(pump1Indicator.getKey(), false);
        boolean hiLevel = tankFillHeightWrapper.isAtHighLevel();
        boolean pump3On = outputs.getOrDefault(pump3Indicator.getKey(), false);
        boolean loLevel = tankFillHeightWrapper.isAtLowLevel();

        if (isRunning && pump1On) {
            controller.startFilling(tankFillHeightWrapper);
        } else {
            controller.stopFilling();
        }

        if (isRunning && pump3On) {
            controller.startDraining(tankFillHeightWrapper);
        } else {
            controller.stopDraining();
        }

        hiLevelIndicator.setActive(hiLevel);
        loLevelIndicator.setActive(loLevel);

        pump1IsOpened(pump1On, hiLevel);

        pump3IsOpened(pump3On, loLevel);

        inputs.put(hiLevelIndicator.getKey(), hiLevelIndicator.isActive());
        inputs.put(loLevelIndicator.getKey(), loLevelIndicator.isActive());

    }

    private void pump3IsOpened(boolean pump3On, boolean loLevel) {
        if (!loLevel && pump3On) {
            if (loLevelActivationTime == null) {
                loLevelActivationTime = System.currentTimeMillis();
            } else {
                long elapsed = System.currentTimeMillis() - loLevelActivationTime;
                if (elapsed > timerForPumpsWarning && !pump3AlertShown) {
                    pump3AlertShown = true;
                    javax.swing.SwingUtilities.invokeLater(() -> {
                        javax.swing.JOptionPane.showMessageDialog(
                                this,
                                "Não havia líquido para o esvaziamento. A bomba, pump3 (Q0.3), explodiu.",
                                "Falha Crítica",
                                javax.swing.JOptionPane.WARNING_MESSAGE
                        );

                        if (onCriticalFailureCallback != null) {
                            onCriticalFailureCallback.run();
                        }

                        this.resetUIState();
                    });
                }
            }
        } else {
            loLevelActivationTime = null;
            pump3AlertShown = false;
        }
    }

    private void pump1IsOpened(boolean pump1On, boolean hiLevel) {

        if (hiLevel && pump1On) {
            if (hiLevelActivationTime == null) {
                hiLevelActivationTime = System.currentTimeMillis();
            } else {
                long elapsed = System.currentTimeMillis() - hiLevelActivationTime;
                if (elapsed > timerForPumpsWarning && !alertShown) {
                    alertShown = true;
                    javax.swing.SwingUtilities.invokeLater(() -> {
                        javax.swing.JOptionPane.showMessageDialog(
                                this,
                                "A bomba de enchimento, pump1 (Q0.1), permaneceu ligada mesmo após o tanque atingir sua capacidade máxima, resultando em um transbordamento que inundou a fábrica.",
                                "Alerta de Segurança",
                                javax.swing.JOptionPane.WARNING_MESSAGE
                        );

                        if (onCriticalFailureCallback != null) {
                            onCriticalFailureCallback.run();
                        }
                        this.resetUIState();
                    });
                }
            }
        } else {
            hiLevelActivationTime = null;
            alertShown = false;
        }

    }

    @Override
    public void stop() {
        loLevelActivationTime = null;
        pump3AlertShown = false;
        hiLevelActivationTime = null;
        alertShown = false;
        controller.stopFilling();
        controller.stopDraining();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);

        Graphics2D g2d = (Graphics2D) g;
        g2d.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);

        controller.drawTankFill(g2d, tankFillHeightWrapper.value);
    }

    @Override
    public void resetUIState() {
        controller.reset();
        tankFillHeightWrapper.value = 0;

        for (RedIndicator indicator : indicators) {
            indicator.setActive(false);
        }

        repaint();
    }

    @Override
    public void setInputListener(InputEventListener listener) {
        inputListener = listener;
        startBt.setInputEventListener(inputListener);
        stopBt.setInputEventListener(inputListener);
    }

    private void initComponents() {
        setBackground(new java.awt.Color(142, 177, 199));
        setMaximumSize(new java.awt.Dimension(624, 394));
        setMinimumSize(new java.awt.Dimension(624, 394));
        setName("");
        setPreferredSize(new java.awt.Dimension(624, 394));

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
                layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                        .addGap(0, 624, Short.MAX_VALUE));
        layout.setVerticalGroup(
                layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                        .addGap(0, 394, Short.MAX_VALUE));

        addButtonsPanel();
        addLedsPanel();
        addSensorIndicators();
    }

    private void addButtonsPanel() {
        JPanel buttonsPanel = new JPanel();
        buttonsPanel.setOpaque(false);
        buttonsPanel.setLayout(new BoxLayout(buttonsPanel, BoxLayout.Y_AXIS));
        buttonsPanel.add(startBt);
        buttonsPanel.add(Box.createVerticalStrut(5));
        buttonsPanel.add(stopBt);

        setLayout(null);
        int panelWidth = 60;
        int panelHeight = 65;
        int x = 81;
        int y = getPreferredSize().height - panelHeight - 117;
        buttonsPanel.setBounds(x, y, panelWidth, panelHeight);

        this.add(buttonsPanel);
    }

    private void addLedsPanel() {
        JPanel ledsPanel = new JPanel();
        ledsPanel.setOpaque(false);
        ledsPanel.setLayout(new BoxLayout(ledsPanel, BoxLayout.Y_AXIS));

        ledsPanel.add(runLed);
        ledsPanel.add(idleLed);
        ledsPanel.add(fullLed);

        int panelWidth = 25;
        int panelHeight = 65;
        int x = 81 - 26 - panelWidth;
        int y = getPreferredSize().height - panelHeight - 100;
        ledsPanel.setBounds(x, y, panelWidth, panelHeight);

        this.add(ledsPanel);
    }

    private void addSensorIndicators() {
        pump1Indicator.setBounds(125, 45, 30, 30);
        mixerIndicator.setBounds(395, 40, 30, 30);
        pump3Indicator.setBounds(550, 378, 30, 30);

        hiLevelIndicator.setBounds(468, 60, 30, 30);
        loLevelIndicator.setBounds(490, 90, 30, 30);

        this.add(pump1Indicator);
        this.add(mixerIndicator);
        this.add(pump3Indicator);
        this.add(hiLevelIndicator);
        this.add(loLevelIndicator);
    }
}
