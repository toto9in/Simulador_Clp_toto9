package ilcompiler.edit;

import javax.swing.JComboBox;

public class Language {

    private static String lingua = "PT-BR";

    public static void setLingua() {
        if (null == lingua) {
            lingua = "PT-BR";
        } else {
            lingua = switch (lingua) {
                case "PT-BR" ->
                    "EN";
                case "EN" ->
                    "JA";
                case "JA" ->
                    "DE";
                case "DE" ->
                    "PT-BR";
                default ->
                    "PT-BR";
            };
        }
    }

    public static String getLingua() {
        return lingua;
    }

    public static JComboBox getArquivar() {
        JComboBox<String> jComboBox = new JComboBox();
        switch (lingua) {
            case "EN" -> {
                jComboBox.addItem("File");
                jComboBox.addItem("Save");
                jComboBox.addItem("Load");
            }
            case "JA" -> {
                jComboBox.addItem("ファイル");
                jComboBox.addItem("保存");
                jComboBox.addItem("ロードするには");
                jComboBox.addItem("項目 4");
            }
            case "DE" -> {
                jComboBox.addItem("Datei");
                jComboBox.addItem("Speichern");
                jComboBox.addItem("Zum Laden");
                jComboBox.addItem("Punkt 4");
            }
            default -> {
                jComboBox.addItem("Arquivo");
                jComboBox.addItem("Salvar");
                jComboBox.addItem("Carregar");
                jComboBox.addItem("Item 4");
            }
        }
        return jComboBox;
    }

    public static JComboBox getEditar() {
        JComboBox<String> jComboBox = new JComboBox();
        switch (lingua) {
            case "EN" -> {
                jComboBox.addItem("Edit");
                jComboBox.addItem("Theme");
                jComboBox.addItem("Language");
            }
            case "JA" -> {
                jComboBox.addItem("編集");
                jComboBox.addItem("テーマ");
                jComboBox.addItem("言語");
            }
            case "DE" -> {
                jComboBox.addItem("Bearbeiten");
                jComboBox.addItem("Thema");
                jComboBox.addItem("Sprache");
            }
            default -> {
                jComboBox.addItem("Editar");
                jComboBox.addItem("Tema");
                jComboBox.addItem("Idioma");
            }
        }
        return jComboBox;
    }

    public static String getAjudar() {
        return switch (lingua) {
            case "EN" ->
                "Help";
            case "JA" ->
                "ヘルプ";
            case "DE" ->
                "Helfen";
            default ->
                "Ajuda";
        };
    }

    public static String getSobre() {
        return switch (lingua) {
            case "EN" ->
                "About";
            case "JA" ->
                "について";
            case "DE" ->
                "Um";
            default ->
                "Sobre";
        };
    }

    public static JComboBox getSimulação() {
        JComboBox<String> jComboBox = new JComboBox();
        switch (lingua) {
            case "EN" -> {
                jComboBox.addItem("Panel (default)");
                jComboBox.addItem("Batch Simulation");
            }
            case "JA" -> {
                jComboBox.addItem("パネル");
                jComboBox.addItem("シミュレーション 1");
            }
            case "DE" -> {
                jComboBox.addItem("Panel");
                jComboBox.addItem("Simulation 1");
            }
            default -> {
                jComboBox.addItem("Painel (padrão)");
                jComboBox.addItem("Simulação Batch");
            }
        }
        return jComboBox;
    }

    public static String getDelay() {
        switch (lingua) {
            case "EN" -> {
                return "Time delay (ms):";
            }
            case "JA" -> {
                return "遅延時間 (ミリ秒):";
            }
            case "DE" -> {
                return "Zeitverzögerung (ms):";
            }
            default -> {
            }
        }
        return "Tempo de delay (ms):";
    }

    public static String getEntradas() {
        switch (lingua) {
            case "EN" -> {
                return "Inputs";
            }
            case "JA" -> {
                return "入力";
            }
            case "DE" -> {
                return "Eingaben";
            }
            default -> {
            }
        }
        return "Entradas";
    }

    public static String getSaidas() {
        switch (lingua) {
            case "EN" -> {
                return "Outputs";
            }
            case "JA" -> {
                return "出力";
            }
            case "DE" -> {
                return "Ausgänge";
            }
            default -> {
            }
        }
        return "Saídas";
    }

    public static String getCodigo() {
        switch (lingua) {
            case "EN" -> {
                return "Code";
            }
            case "JA" -> {
                return "コード";
            }
            case "DE" -> {
                return "Code";
            }
            default -> {
            }
        }
        return "Código";
    }

    public static String getValor() {
        switch (lingua) {
            case "EN" -> {
                return "Value:";
            }
            case "JA" -> {
                return "価値:";
            }
            case "DE" -> {
                return "Wert:";
            }
            default -> {
            }
        }
        return "Valor:";
    }

    public static String getType() {
        switch (lingua) {
            case "EN" -> {
                return "Type:";
            }
            case "JA" -> {
                return "タイプ:";
            }
            case "DE" -> {
                return "Typ:";
            }
            default -> {
            }
        }
        return "Tipo";
    }

    public static String getPreset() {
        switch (lingua) {
            case "EN" -> {
                return "Preset:";
            }
            case "JA" -> {
                return "プリセット:";
            }
            case "DE" -> {
                return "Voreingestellt:";
            }
            default -> {
            }
        }
        return "Predefinição:";
    }
}
