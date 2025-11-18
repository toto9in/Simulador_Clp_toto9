package screens.scenes;

import ilcompiler.input.Input.InputType;
import java.util.Map;
import javax.swing.ImageIcon;

public class DefaultScenePanel extends javax.swing.JPanel implements IScenePanel {

    private InputEventListener inputListener;
    private ImageIcon openSwitchIcon, closedSwitchIcon, buttonIcon, closedButtonIcon, openPiButtonIcon, piButtonIcon,
            offLedIcon, onLedIcon;

    public DefaultScenePanel() {
        super();
        initComponents();
        inputColumnLabel.setText("Entradas");
        outputColumnLabel.setText("Saídas");
    }

    @Override
    public void initInputs(Map<String, InputType> inputsType, Map<String, Boolean> inputs) {
        for (var key : inputsType.keySet()) {
            inputsType.put(key, InputType.SWITCH);
            inputs.put(key, false);
        }
    }

    @Override
    public void updateUIState(Map<String, InputType> inputsType, Map<String, Boolean> inputs,
            Map<String, Boolean> outputs) {
        int iconWidth = outputLed1.getWidth();
        int iconHeight = outputLed1.getHeight();

        openSwitchIcon = new ImageIcon(getClass().getResource("/Assets/chave_aberta.png"));
        openSwitchIcon.setImage(openSwitchIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        closedSwitchIcon = new ImageIcon(getClass().getResource("/Assets/chave_fechada.png"));
        closedSwitchIcon.setImage(closedSwitchIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        buttonIcon = new ImageIcon(getClass().getResource("/Assets/buttom.png"));
        buttonIcon.setImage(buttonIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        closedButtonIcon = new ImageIcon(getClass().getResource("/Assets/botao_fechado.png"));
        closedButtonIcon.setImage(closedButtonIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        openPiButtonIcon = new ImageIcon(getClass().getResource("/Assets/button_pi_aberto.png"));
        openPiButtonIcon.setImage(openPiButtonIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        piButtonIcon = new ImageIcon(getClass().getResource("/Assets/buttom_pi.png"));
        piButtonIcon.setImage(piButtonIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        offLedIcon = new ImageIcon(getClass().getResource("/Assets/led_desligado.png"));
        offLedIcon.setImage(offLedIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        onLedIcon = new ImageIcon(getClass().getResource("/Assets/led_ligado.png"));
        onLedIcon.setImage(onLedIcon.getImage().getScaledInstance(iconWidth, iconHeight, 1));

        inputButton1.setIcon(getInputIcon(inputsType.get("I0.0"), inputs.get("I0.0")));
        inputButton2.setIcon(getInputIcon(inputsType.get("I0.1"), inputs.get("I0.1")));
        inputButton3.setIcon(getInputIcon(inputsType.get("I0.2"), inputs.get("I0.2")));
        inputButton4.setIcon(getInputIcon(inputsType.get("I0.3"), inputs.get("I0.3")));
        inputButton5.setIcon(getInputIcon(inputsType.get("I0.4"), inputs.get("I0.4")));
        inputButton6.setIcon(getInputIcon(inputsType.get("I0.5"), inputs.get("I0.5")));
        inputButton7.setIcon(getInputIcon(inputsType.get("I0.6"), inputs.get("I0.6")));
        inputButton8.setIcon(getInputIcon(inputsType.get("I0.7"), inputs.get("I0.7")));

        outputLed1.setIcon(getOutputIcon(outputs.get("Q0.0")));
        outputLed2.setIcon(getOutputIcon(outputs.get("Q0.1")));
        outputLed3.setIcon(getOutputIcon(outputs.get("Q0.2")));
        outputLed4.setIcon(getOutputIcon(outputs.get("Q0.3")));
        outputLed5.setIcon(getOutputIcon(outputs.get("Q0.4")));
        outputLed6.setIcon(getOutputIcon(outputs.get("Q0.5")));
        outputLed7.setIcon(getOutputIcon(outputs.get("Q0.6")));
        outputLed8.setIcon(getOutputIcon(outputs.get("Q0.7")));
    }

    @Override
    public void stop() {
        // No specific stop action for this panel
    }

    private ImageIcon getInputIcon(InputType inputType, boolean inputState) {
        return switch (inputType) {
            case SWITCH ->
                inputState ? closedSwitchIcon : openSwitchIcon;
            case NO ->
                inputState ? closedButtonIcon : buttonIcon;
            case NC ->
                inputState ? piButtonIcon : openPiButtonIcon;
        };
    }

    private ImageIcon getOutputIcon(boolean outputState) {
        return outputState ? onLedIcon : offLedIcon;
    }

    @Override
    public void setInputListener(InputEventListener listener) {
        this.inputListener = listener;
    }

    @Override
    public void setOnCriticalFailureCallback(Runnable callback) {
        // No specific critical failure behavior for this panel, but method must be present
    }

    @Override
    public void resetUIState() {
    

    /// No state to reset in this panel
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated
    // Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        outputLed1 = new javax.swing.JLabel();
        outputLed2 = new javax.swing.JLabel();
        outputLed4 = new javax.swing.JLabel();
        outputLed3 = new javax.swing.JLabel();
        outputLed5 = new javax.swing.JLabel();
        outputLed6 = new javax.swing.JLabel();
        outputLed7 = new javax.swing.JLabel();
        outputLed8 = new javax.swing.JLabel();
        inputColumnLabel = new javax.swing.JLabel();
        outputColumnLabel = new javax.swing.JLabel();
        inputButton5 = new javax.swing.JLabel();
        inputButton1 = new javax.swing.JLabel();
        inputButton6 = new javax.swing.JLabel();
        inputButton2 = new javax.swing.JLabel();
        inputButton8 = new javax.swing.JLabel();
        inputButton4 = new javax.swing.JLabel();
        inputButton7 = new javax.swing.JLabel();
        inputButton3 = new javax.swing.JLabel();
        jLabel1 = new javax.swing.JLabel();
        jLabel2 = new javax.swing.JLabel();
        jLabel4 = new javax.swing.JLabel();
        jLabel5 = new javax.swing.JLabel();
        jLabel6 = new javax.swing.JLabel();
        jLabel7 = new javax.swing.JLabel();
        jLabel8 = new javax.swing.JLabel();
        jLabel9 = new javax.swing.JLabel();

        setBackground(new java.awt.Color(142, 177, 199));
        setMaximumSize(new java.awt.Dimension(624, 394));
        setMinimumSize(new java.awt.Dimension(624, 394));
        setPreferredSize(new java.awt.Dimension(624, 394));

        outputLed1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        outputLed2.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        outputLed4.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        outputLed3.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        outputLed5.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        outputLed6.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        outputLed7.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        outputLed8.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/led_desligado.png"))); // NOI18N

        inputColumnLabel.setFont(new java.awt.Font("Segoe UI Black", 2, 24)); // NOI18N
        inputColumnLabel.setText("Entradas");
        inputColumnLabel.setFocusable(false);
        inputColumnLabel.setHorizontalTextPosition(javax.swing.SwingConstants.LEFT);

        outputColumnLabel.setFont(new java.awt.Font("Segoe UI Black", 2, 24)); // NOI18N
        outputColumnLabel.setText("Saídas");
        outputColumnLabel.setToolTipText("");
        outputColumnLabel.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);

        inputButton5.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton5.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton5MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton5MouseReleased(evt);
            }
        });

        inputButton1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton1.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton1MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton1MouseReleased(evt);
            }
        });

        inputButton6.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton6.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton6MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton6MouseReleased(evt);
            }
        });

        inputButton2.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton2.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton2MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton2MouseReleased(evt);
            }
        });

        inputButton8.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton8.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton8MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton8MouseReleased(evt);
            }
        });

        inputButton4.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton4.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton4MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton4MouseReleased(evt);
            }
        });

        inputButton7.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton7.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton7MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton7MouseReleased(evt);
            }
        });

        inputButton3.setIcon(new javax.swing.ImageIcon(getClass().getResource("/Assets/chave_aberta.png"))); // NOI18N
        inputButton3.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mousePressed(java.awt.event.MouseEvent evt) {
                inputButton3MousePressed(evt);
            }

            public void mouseReleased(java.awt.event.MouseEvent evt) {
                inputButton3MouseReleased(evt);
            }
        });

        jLabel1.setText("I0.0");

        jLabel2.setText("I0.1");

        jLabel4.setText("I0.3");

        jLabel5.setText("I0.4");

        jLabel6.setText("I0.6");

        jLabel7.setText("I0.5");

        jLabel8.setText("I0.7");

        jLabel9.setText("I0.2");

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
                layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                        .addGap(0, 636, Short.MAX_VALUE)
                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                                .addGroup(layout.createSequentialGroup()
                                        .addGap(49, 49, 49)
                                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                                                .addGroup(layout.createSequentialGroup()
                                                        .addComponent(inputButton1,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE)
                                                        .addGap(26, 26, 26)
                                                        .addComponent(inputButton5,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE))
                                                .addGroup(layout.createSequentialGroup()
                                                        .addComponent(inputButton2,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE)
                                                        .addGap(26, 26, 26)
                                                        .addComponent(inputButton6,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE))
                                                .addGroup(layout.createSequentialGroup()
                                                        .addComponent(inputButton3,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE)
                                                        .addGap(26, 26, 26)
                                                        .addComponent(inputButton7,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE))
                                                .addGroup(layout.createSequentialGroup()
                                                        .addComponent(inputButton4,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE)
                                                        .addGap(26, 26, 26)
                                                        .addComponent(inputButton8,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 100,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE))
                                                .addGroup(layout.createSequentialGroup()
                                                        .addGap(21, 21, 21)
                                                        .addComponent(inputColumnLabel,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 175,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE)))
                                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED,
                                                javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                                                .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout
                                                        .createSequentialGroup()
                                                        .addGroup(layout
                                                                .createParallelGroup(
                                                                        javax.swing.GroupLayout.Alignment.LEADING)
                                                                .addComponent(outputLed4,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(outputLed3,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(outputLed1,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(outputLed2,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                                        .addGap(31, 31, 31)
                                                        .addGroup(layout
                                                                .createParallelGroup(
                                                                        javax.swing.GroupLayout.Alignment.LEADING)
                                                                .addComponent(outputLed8,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(outputLed7,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(outputLed5,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(outputLed6,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 45,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                                        .addGap(46, 46, 46))
                                                .addComponent(outputColumnLabel,
                                                        javax.swing.GroupLayout.Alignment.TRAILING,
                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 150,
                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                        .addGap(49, 49, 49))));
        layout.setVerticalGroup(
                layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                        .addGap(0, 406, Short.MAX_VALUE)
                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                                .addGroup(layout.createSequentialGroup()
                                        .addGap(42, 42, 42)
                                        .addGroup(layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                                                .addComponent(inputColumnLabel, javax.swing.GroupLayout.PREFERRED_SIZE,
                                                        44, javax.swing.GroupLayout.PREFERRED_SIZE)
                                                .addComponent(outputColumnLabel))
                                        .addGap(20, 20, 20)
                                        .addGroup(layout
                                                .createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                                                .addGroup(layout.createSequentialGroup()
                                                        .addComponent(outputLed5,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 50,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE)
                                                        .addPreferredGap(
                                                                javax.swing.LayoutStyle.ComponentPlacement.RELATED,
                                                                javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                                                        .addComponent(outputLed8,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE, 50,
                                                                javax.swing.GroupLayout.PREFERRED_SIZE))
                                                .addGroup(layout.createSequentialGroup()
                                                        .addGroup(layout
                                                                .createParallelGroup(
                                                                        javax.swing.GroupLayout.Alignment.LEADING)
                                                                .addComponent(outputLed1,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 50,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(inputButton5,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 35,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                .addComponent(inputButton1,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE, 35,
                                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                                        .addGroup(layout
                                                                .createParallelGroup(
                                                                        javax.swing.GroupLayout.Alignment.LEADING)
                                                                .addGroup(layout.createSequentialGroup()
                                                                        .addGap(21, 21, 21)
                                                                        .addGroup(layout.createParallelGroup(
                                                                                javax.swing.GroupLayout.Alignment.LEADING)
                                                                                .addComponent(inputButton6,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        35,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                                .addComponent(inputButton2,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        35,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                                                        .addGap(29, 29, 29)
                                                                        .addGroup(layout.createParallelGroup(
                                                                                javax.swing.GroupLayout.Alignment.LEADING)
                                                                                .addComponent(inputButton7,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        35,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                                .addComponent(inputButton3,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        35,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                                                        .addGap(26, 26, 26)
                                                                        .addGroup(layout.createParallelGroup(
                                                                                javax.swing.GroupLayout.Alignment.LEADING)
                                                                                .addComponent(inputButton8,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        35,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                                .addComponent(inputButton4,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        35,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)))
                                                                .addGroup(layout.createSequentialGroup()
                                                                        .addGap(18, 18, 18)
                                                                        .addGroup(layout.createParallelGroup(
                                                                                javax.swing.GroupLayout.Alignment.TRAILING)
                                                                                .addComponent(outputLed6,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        50,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                                .addComponent(outputLed2,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        50,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                                                        .addGap(18, 18, 18)
                                                                        .addGroup(layout.createParallelGroup(
                                                                                javax.swing.GroupLayout.Alignment.LEADING)
                                                                                .addComponent(outputLed3,
                                                                                        javax.swing.GroupLayout.Alignment.TRAILING,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        50,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE)
                                                                                .addComponent(outputLed7,
                                                                                        javax.swing.GroupLayout.Alignment.TRAILING,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                        50,
                                                                                        javax.swing.GroupLayout.PREFERRED_SIZE))
                                                                        .addGap(21, 21, 21)
                                                                        .addComponent(outputLed4,
                                                                                javax.swing.GroupLayout.PREFERRED_SIZE,
                                                                                50,
                                                                                javax.swing.GroupLayout.PREFERRED_SIZE)))))
                                        .addContainerGap(43, Short.MAX_VALUE))));
    }// </editor-fold>//GEN-END:initComponents

    private void inputButton3MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton3MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.2", evt);
        }
    }// GEN-LAST:event_inputButton3MouseReleased

    private void inputButton3MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton3MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.2", evt);
        }
    }// GEN-LAST:event_inputButton3MousePressed

    private void inputButton7MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton7MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.6", evt);
        }
    }// GEN-LAST:event_inputButton7MouseReleased

    private void inputButton7MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton7MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.6", evt);
        }
    }// GEN-LAST:event_inputButton7MousePressed

    private void inputButton4MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton4MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.3", evt);
        }
    }// GEN-LAST:event_inputButton4MouseReleased

    private void inputButton4MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton4MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.3", evt);
        }
    }// GEN-LAST:event_inputButton4MousePressed

    private void inputButton8MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton8MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.7", evt);
        }
    }// GEN-LAST:event_inputButton8MouseReleased

    private void inputButton8MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton8MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.7", evt);
        }
    }// GEN-LAST:event_inputButton8MousePressed

    private void inputButton2MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton2MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.1", evt);
        }
    }// GEN-LAST:event_inputButton2MouseReleased

    private void inputButton2MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton2MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.1", evt);
        }
    }// GEN-LAST:event_inputButton2MousePressed

    private void inputButton6MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton6MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.5", evt);
        }
    }// GEN-LAST:event_inputButton6MouseReleased

    private void inputButton6MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton6MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.5", evt);
        }
    }// GEN-LAST:event_inputButton6MousePressed

    private void inputButton1MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton1MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.0", evt);
        }
    }// GEN-LAST:event_inputButton1MouseReleased

    private void inputButton1MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton1MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.0", evt);
        }
    }// GEN-LAST:event_inputButton1MousePressed

    private void inputButton5MouseReleased(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton5MouseReleased
        if (inputListener != null) {
            inputListener.onReleased("I0.4", evt);
        }
    }// GEN-LAST:event_inputButton5MouseReleased

    private void inputButton5MousePressed(java.awt.event.MouseEvent evt) {// GEN-FIRST:event_inputButton5MousePressed
        if (inputListener != null) {
            inputListener.onPressed("I0.4", evt);
        }
    }// GEN-LAST:event_inputButton5MousePressed

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JLabel inputButton1;
    private javax.swing.JLabel inputButton2;
    private javax.swing.JLabel inputButton3;
    private javax.swing.JLabel inputButton4;
    private javax.swing.JLabel inputButton5;
    private javax.swing.JLabel inputButton6;
    private javax.swing.JLabel inputButton7;
    private javax.swing.JLabel inputButton8;
    private javax.swing.JLabel inputColumnLabel;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JLabel jLabel2;
    private javax.swing.JLabel jLabel4;
    private javax.swing.JLabel jLabel5;
    private javax.swing.JLabel jLabel6;
    private javax.swing.JLabel jLabel7;
    private javax.swing.JLabel jLabel8;
    private javax.swing.JLabel jLabel9;
    private javax.swing.JLabel outputColumnLabel;
    private javax.swing.JLabel outputLed1;
    private javax.swing.JLabel outputLed2;
    private javax.swing.JLabel outputLed3;
    private javax.swing.JLabel outputLed4;
    private javax.swing.JLabel outputLed5;
    private javax.swing.JLabel outputLed6;
    private javax.swing.JLabel outputLed7;
    private javax.swing.JLabel outputLed8;
    // End of variables declaration//GEN-END:variables

}
