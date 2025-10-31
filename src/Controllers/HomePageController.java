package Controllers;

import Models.HomePageModel;
import ilcompiler.edit.Language;
import ilcompiler.memoryvariable.MemoryVariable;
import ilcompiler.input.InputActions;
import ilcompiler.output.OutputActions;
import ilcompiler.interpreter.Interpreter;
import screens.HomePg;
import save.Save;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class HomePageController {

    private final HomePg homePage;

    public HomePageController(HomePg homePage) {
        this.homePage = homePage;
    }

    // -------------------- Funções para Labels --------------------
    private static void updateLabels(MemoryVariable variable, JLabel mainLabel, JLabel currentLabel, JLabel stopLabel) {
        mainLabel.setText(String.valueOf(variable.id));
        mainLabel.setHorizontalTextPosition(JLabel.CENTER);
        mainLabel.setVerticalTextPosition(JLabel.CENTER);
        mainLabel.setForeground(Color.WHITE);
        currentLabel.setText(String.valueOf(variable.counter));
        currentLabel.setHorizontalAlignment(SwingConstants.CENTER);
        stopLabel.setText(String.valueOf(variable.maxTimer));
        stopLabel.setHorizontalAlignment(SwingConstants.CENTER);
    }

    public static void updateTimerLabels(List<MemoryVariable> tVariables, List<JLabel> timerLabels,
            List<JLabel> currentLabels, List<JLabel> stopLabels) {
        for (int i = 0; i < tVariables.size(); i++) {
            updateLabels(tVariables.get(i), timerLabels.get(i), currentLabels.get(i), stopLabels.get(i));
        }
    }

    public static void updateCounterLabels(List<MemoryVariable> cVariables, List<JLabel> counterLabels,
            List<JLabel> currentLabels, List<JLabel> stopLabels) {
        for (int i = 0; i < cVariables.size(); i++) {
            updateLabels(cVariables.get(i), counterLabels.get(i), currentLabels.get(i), stopLabels.get(i));

        }
    }

    // -------------------- Função para Ações de Arquivar Arquivo
    // --------------------
    public static void handleFileArchiveAction(
            JComboBox<String> arquivarComboBox,
            JTextArea codigoCampTextArea,
            boolean updating,
            HomePg homePageInstance) {

        if (updating) {
            return;
        }

        if (Language.getArquivar().getItemAt(2).equals(arquivarComboBox.getSelectedItem().toString())) {
            JFileChooser c = new JFileChooser();
            String filename = "";
            String dir = "";
            int rVal = c.showOpenDialog(homePageInstance);
            if (rVal == JFileChooser.APPROVE_OPTION) {
                filename = c.getSelectedFile().getName();
                dir = c.getCurrentDirectory().toString();
            }
            List<String> memory;
            try {
                memory = Save.load(dir + "\\" + filename);
                codigoCampTextArea.setText("");
                for (String line : memory) {
                    codigoCampTextArea.append(line);
                    codigoCampTextArea.append("\n");
                }
            } catch (IOException ex) {
                ex.printStackTrace();
            }
            arquivarComboBox.setSelectedIndex(0);
        }

        if (arquivarComboBox.getItemAt(1).equals(arquivarComboBox.getSelectedItem())) {
            arquivarComboBox.setSelectedIndex(0);

            JFileChooser c = new JFileChooser();
            String filename = "";
            String dir = "";
            int rVal = c.showSaveDialog(homePageInstance);
            if (rVal == JFileChooser.APPROVE_OPTION) {
                filename = c.getSelectedFile().getName();
                dir = c.getCurrentDirectory().toString();
            }

            List<String> memory = new ArrayList<>();
            memory = homePageInstance.saveLines(memory);

            try {
                Save.save(dir + "\\" + filename, memory);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }

    // -------------------- Funções para Controle do Ciclo e Timers
    // --------------------
    public Integer parseDelay(String delayStr) {
        if (delayStr == null || delayStr.isBlank()) {
            return 0;
        }
        try {
            return Integer.valueOf(delayStr);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public void runCycle(ActionEvent evt) {
        if (!HomePageModel.isRunning()) {
            ((Timer) evt.getSource()).stop();
            return;
        }

        List<String> lineList = homePage.saveLines(new ArrayList<>());

        HomePageModel.setInputs(InputActions.read(HomePageModel.getInputs()));
        /* TODO - Investigar se podemos realmente deixar isso aqui comentado */
        // HomePageModel.setOutputs(OutputActions.resetOutputs(HomePageModel.getOutputs()));
        HomePageModel.setOutputs(
                Interpreter.receiveLines(lineList, HomePageModel.getInputs(), HomePageModel.getOutputs(),
                        HomePageModel.getMemoryVariables()));

        updateTimersState();

        homePage.updateMode();
        homePage.updateSceneUI();
        homePage.updateMemoryVariables();
    }

    public void updateTimersState() {
        for (Map.Entry<String, MemoryVariable> variable : HomePageModel.getMemoryVariables().entrySet()) {
            if (variable.getKey().charAt(0) != 'T') {
                continue;
            }

            MemoryVariable var = variable.getValue();
            boolean isOnTimer = "ON".equals(var.timerType);
            boolean isOffTimer = "OFF".equals(var.timerType);

            if (isOnTimer) {
                if (var.currentValue) {
                    var.timer.start();
                } else {
                    var.timer.stop();
                    var.counter = 0;
                    var.endTimer = false;
                }
            } else if (isOffTimer) {
                if (var.currentValue) {
                    var.timer.stop();
                    var.counter = 0;
                    var.endTimer = true;
                } else {
                    var.timer.start();
                }
            }
        }
    }

    public void stopTimers() {
        for (Map.Entry<String, MemoryVariable> variable : HomePageModel.getMemoryVariables().entrySet()) {
            if (variable.getKey().charAt(0) == 'T') {
                variable.getValue().timer.stop();
            }
        }
    }

    public void resetTimers() {
        for (Map.Entry<String, MemoryVariable> variable : HomePageModel.getMemoryVariables().entrySet()) {
            if (variable.getKey().charAt(0) == 'T') {
                variable.getValue().counter = 0;
            }
        }
    }

    public void handleRefreshAction() {
        if (HomePageModel.isRunning()) {
            return;
        }

        HomePageModel.setOutputs(OutputActions.resetOutputs(HomePageModel.getOutputs()));

        for (Map.Entry<String, MemoryVariable> entry : HomePageModel.getMemoryVariables().entrySet()) {
            MemoryVariable variable = entry.getValue();
            variable.timer.stop();
            variable.counter = 0;
            variable.currentValue = false;
        }

        homePage.updateMemoryVariables();
        homePage.updateSceneUI();
    }

}
