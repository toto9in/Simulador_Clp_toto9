package ilcompiler.interpreter;

import ilcompiler.memoryvariable.MemoryVariable;
import screens.HomePg;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Classe que interpreta as intruções
public class Interpreter {

    // Cria variáveis
    static Boolean accumulator;
    static List<String> validOperators = new ArrayList<>();

    // Define operadores válidos
    public static void initializeValidOperators() {
        validOperators.add("LD");
        validOperators.add("LDN");
        validOperators.add("ST");
        validOperators.add("STN");
        validOperators.add("AND");
        validOperators.add("ANDN");
        validOperators.add("OR");
        validOperators.add("ORN");
        validOperators.add("TON");
        validOperators.add("TOFF");
        validOperators.add("CTD");
        validOperators.add("CTU");
    }

    // Recebe linhas vindas da tela e separa operador e variável
    public static Map receiveLines(List<String> lineList, Map<String, Boolean> inputs, Map<String, Boolean> outputs,
            Map<String, MemoryVariable> memoryVariables) {

        // Variáveis auxiliares
        char character = '-';
        Boolean spaceDetected = false;
        String operator = "";
        String variable = "";
        ArrayList<String> variables = new ArrayList();
        Boolean justEmptyLines = true;

        initializeValidOperators();

        // Limpa acumulador
        accumulator = null;

        // Itera lista de linhas
        for (int i = 0; i < lineList.size(); i++) {
            // Integer currentLine = i + 1;
            // System.out.println("\n-> Linha: " + currentLine.toString());

            // Ignora linhas vazias
            if (!lineList.get(i).isBlank()) {
                justEmptyLines = false;
                // Itera caracteres da linha
                for (int j = 0; j < lineList.get(i).length(); j++) {
                    character = lineList.get(i).charAt(j);

                    if (character != ' ' && character != '\n' && character != '\t' && character != ','
                            && !spaceDetected) {
                        operator = operator + character;
                    }

                    if ((character == ' ' || character == '\t') && !operator.equals("")) {
                        spaceDetected = true;
                    }

                    if (character == ',' && !operator.equals("")) {
                        variables.add(variable);
                        variable = "";
                    }

                    if (character != ' ' && character != '\n' && character != '\t' && character != ','
                            && spaceDetected) {
                        variable = variable + character;
                    }
                }

                variables.add(variable);

                // System.out.println("Operador: " + operator);
                // System.out.println("Variável: " + variables);

                outputs = executeInstruction(operator, variables, inputs, outputs, memoryVariables);
            }

            spaceDetected = false;
            operator = "";
            variable = "";
            variables.clear();
        }

        if (justEmptyLines) {
            HomePg.showErrorMessage("Insira as intruções para o CLP!");
        }

        return outputs;
    }

    // Verifica se operador é válido
    public static boolean operatorIsValid(String operator) {
        Boolean isValid = false;
        for (int i = 0; i < validOperators.size(); i++) {
            if (!isValid && validOperators.get(i).equals(operator)) {
                isValid = true;
                // System.out.println("Operador válido!");
            }
        }
        return isValid;
    }

    public static String getMemoryType(String variable) {
        String type = "";
        String code = "";
        int cod = -1;
        for (int i = 0; i < variable.length(); i++) {
            if (variable.charAt(i) > '0' && variable.charAt(i) < '9') {
                code = code + variable.charAt(i);
            } else {
                type = type + variable.charAt(i);
            }
        }

        try {
            cod = Integer.parseInt(code);
        } catch (Exception E) {

        }

        if (!type.equals("M") && !type.equals("T") && !type.equals("C")) {
            HomePg.showErrorMessage("Sintaxe incorreta! Espaço de memória " + variable + " não existe!");
        } else if (cod != -1) {
            return type;
        } else {
            HomePg.showErrorMessage("Sintaxe incorreta! Espaço de memória " + variable + " não existe!");
        }

        return "";
    }

    // Verifica se entrada é válido
    public static boolean inputIsValid(ArrayList<String> variables, Map<String, Boolean> inputs) {
        Boolean isValid = true;

        if (inputs.get(variables.get(0)) == null) {
            isValid = false;
            // System.out.println("Não é uma entrada válida!");
        }
        return isValid;
    }

    // Verifica se saída é válida
    public static boolean outputIsValid(ArrayList<String> variables, Map<String, Boolean> outputs) {
        Boolean isValid = true;

        if (outputs.get(variables.get(0)) == null) {
            isValid = false;
            // System.out.println("Saida invalida!");
        }
        return isValid;
    }

    // Verifica se variável de memória é válida
    public static boolean memoryVariableIsValid(ArrayList<String> variables,
            Map<String, MemoryVariable> memoryVariables) {
        Boolean isValid = true;

        if (memoryVariables.get(variables.get(0)) == null) {
            isValid = false;
            // System.out.println("Não é uma memória válida!");
        }
        return isValid;
    }

    // Executa instruções
    public static Map executeInstruction(String operator, ArrayList<String> variables, Map<String, Boolean> inputs,
            Map<String, Boolean> outputs, Map<String, MemoryVariable> memoryVariables) {
        // System.out.println(variables.get(0));
        // Caso operador seja válido e tenhamos como variável uma entrada ou uma saida
        if (operatorIsValid(operator) && (inputIsValid(variables, inputs) || outputIsValid(variables, outputs))) {

            // Carrega entrada ou saida para o acumulador
            if (operator.equals("LD")) {
                if (variables.get(0).charAt(0) == 'I') {
                    accumulator = inputs.get(variables.get(0));
                }

                if (variables.get(0).charAt(0) == 'Q') {
                    accumulator = outputs.get(variables.get(0));
                }
            }

            // Carrega entrada ou saida negada para o acumulador
            if (operator.equals("LDN")) {
                if (variables.get(0).charAt(0) == 'I') {
                    accumulator = !(inputs.get(variables.get(0)));
                }

                if (variables.get(0).charAt(0) == 'Q') {
                    accumulator = !(outputs.get(variables.get(0)));
                }
            }

            // Verifica se o valor do acumulador não é nulo
            if (accumulator != null) {
                if (operator.equals("ST") || operator.equals("STN")) {
                    if (outputIsValid(variables, outputs)) {
                        // Carrega o valor do acumulador para a variável (saida)
                        if (operator.equals("ST")) {
                            if (variables.get(0).charAt(0) == 'Q') {
                                outputs.put(variables.get(0), accumulator);
                            }
                        }

                        // Carrega o valor do acumulador negado para a variável (saida)
                        if (operator.equals("STN")) {
                            if (variables.get(0).charAt(0) == 'Q') {
                                outputs.put(variables.get(0), !accumulator);
                            }
                        }
                    } else {
                        HomePg.showErrorMessage(
                                "Entradas não podem ser modificadas, portanto, operadores ST e STN não são válidos para entradas!");
                    }
                }

                // Faz operação AND entre o acumulador e a variável (entrada ou saida) e salva
                // no acumulador
                if (operator.equals("AND")) {
                    if (variables.get(0).charAt(0) == 'I') {
                        accumulator = (accumulator && inputs.get(variables.get(0)));
                    }

                    if (variables.get(0).charAt(0) == 'Q') {
                        accumulator = (accumulator && outputs.get(variables.get(0)));
                    }
                }

                // Faz operação AND entre o acumulador e a variável (entrada ou saida) negada e
                // salva no acumulador
                if (operator.equals("ANDN")) {
                    if (variables.get(0).charAt(0) == 'I') {
                        accumulator = (accumulator && !(inputs.get(variables.get(0))));
                    }

                    if (variables.get(0).charAt(0) == 'Q') {
                        accumulator = (accumulator && !(outputs.get(variables.get(0))));
                    }
                }

                // Faz operação OR entre o acumulador e a variável (entrada ou saida) e salva no
                // acumulador
                if (operator.equals("OR")) {
                    if (variables.get(0).charAt(0) == 'I') {
                        accumulator = (accumulator || inputs.get(variables.get(0)));
                    }

                    if (variables.get(0).charAt(0) == 'Q') {
                        accumulator = (accumulator || outputs.get(variables.get(0)));
                    }
                }

                // Faz operação OR entre o acumulador e a variável (entrada ou saida) negada e
                // salva no acumulador
                if (operator.equals("ORN")) {
                    if (variables.get(0).charAt(0) == 'I') {
                        accumulator = (accumulator || !(inputs.get(variables.get(0))));
                    }

                    if (variables.get(0).charAt(0) == 'Q') {
                        accumulator = (accumulator || !(outputs.get(variables.get(0))));
                    }
                }

                // System.out.println("Acumulador: " + accumulator);
                // System.out.println("Entradas: " + inputs);
                // System.out.println("Saidas: " + outputs);
            } else {
                HomePg.showErrorMessage(
                        "Acumulador vazio! Carregue inicialmente a variável desejada para o acumulador com as funções LD ou LDN!");
            }

            // Caso operador seja válido e tenhamos como variável uma memória
        } else if (operatorIsValid(operator) && !inputIsValid(variables, inputs)
                && !outputIsValid(variables, outputs)) {
            // Para operações de carregamento (onde variável de memória são criadas)
            if (operator.equals("ST") || operator.equals("STN") || operator.equals("TON") || operator.equals("TOFF")
                    || operator.equals("CTD") || operator.equals("CTU")) {
                // Se memória já existe, só atualiza no hash
                String type = getMemoryType(variables.get(0));
                if (!type.equals("")) {
                    if (memoryVariableIsValid(variables, memoryVariables)) {
                        if (operator.equals("ST")) {
                            if (type.equals("C") && memoryVariables.get(variables.get(0)).counterType.equals("UP")) {
                                memoryVariables.get(variables.get(0)).testEndTimer();
                                if (memoryVariables.get(variables.get(0)).currentValue == false && accumulator) {
                                    memoryVariables.get(variables.get(0)).incrementCounter();
                                }
                            } else if (type.equals("C")
                                    && memoryVariables.get(variables.get(0)).counterType.equals("DOWN")) {
                                memoryVariables.get(variables.get(0)).testEndTimer();
                                if (memoryVariables.get(variables.get(0)).currentValue == false && accumulator) {
                                    memoryVariables.get(variables.get(0)).decrementCounter();
                                }
                            }
                            memoryVariables.get(variables.get(0)).currentValue = accumulator;
                        }

                        if (operator.equals("STN")) {
                            if (type.equals("C") && memoryVariables.get(variables.get(0)).counterType.equals("UP")) {
                                memoryVariables.get(variables.get(0)).testEndTimer();
                                if (memoryVariables.get(variables.get(0)).currentValue == true && !accumulator) {
                                    memoryVariables.get(variables.get(0)).incrementCounter();
                                }
                            } else if (type.equals("C")
                                    && memoryVariables.get(variables.get(0)).counterType.equals("DOWN")) {
                                memoryVariables.get(variables.get(0)).testEndTimer();
                                if (memoryVariables.get(variables.get(0)).currentValue == true && !accumulator) {
                                    memoryVariables.get(variables.get(0)).decrementCounter();
                                }
                            }
                            memoryVariables.get(variables.get(0)).currentValue = !accumulator;
                        }

                        if (operator.equals("TON") && type.equals("T")) {
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).timerType = "ON";
                        } else if (operator.equals("TON")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }

                        if (operator.equals("TOFF") && type.equals("T")) {
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).timerType = "OFF";
                        } else if (operator.equals("TOFF")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }

                        if (operator.equals("CTD") && type.equals("C")) {
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).counterType = "DOWN";
                        } else if (operator.equals("CTD")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }

                        if (operator.equals("CTU") && type.equals("C")) {
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).counterType = "UP";
                        } else if (operator.equals("CTU")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }
                        // Se memória não existe, ela é criada e e guardada no hash
                    } else {
                        if (operator.equals("ST")) {
                            memoryVariables.put(variables.get(0), new MemoryVariable(variables.get(0)));
                            memoryVariables.get(variables.get(0)).currentValue = accumulator;
                        }

                        if (operator.equals("STN")) {
                            memoryVariables.put(variables.get(0), new MemoryVariable(variables.get(0)));
                            memoryVariables.get(variables.get(0)).currentValue = accumulator;
                        }

                        if (operator.equals("TON") && type.equals("T")) {
                            memoryVariables.put(variables.get(0), new MemoryVariable(variables.get(0)));
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).timerType = "ON";
                        } else if (operator.equals("TON")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }

                        if (operator.equals("TOFF") && type.equals("T")) {
                            memoryVariables.put(variables.get(0), new MemoryVariable(variables.get(0)));
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).timerType = "OFF";
                        } else if (operator.equals("TOFF")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }

                        if (operator.equals("CTD") && type.equals("C")) {
                            memoryVariables.put(variables.get(0), new MemoryVariable(variables.get(0)));
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).counterType = "DOWN";
                        } else if (operator.equals("CTD")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }

                        if (operator.equals("CTU") && type.equals("C")) {
                            memoryVariables.put(variables.get(0), new MemoryVariable(variables.get(0)));
                            memoryVariables.get(variables.get(0)).maxTimer = Integer.parseInt(variables.get(1));
                            memoryVariables.get(variables.get(0)).counterType = "UP";
                        } else if (operator.equals("CTU")) {
                            HomePg.showErrorMessage(
                                    "Sintaxe incorreta! Espaço de memória " + variables.get(0) + " invalido!");
                        }
                    }
                }
                // System.out.println("Acumulador: " + accumulator);
                // System.out.println("Entradas: " + inputs);
                // System.out.println("Saidas: " + outputs);
                // System.out.println("Variáveis de memória: " + memoryVariables);
                // Outras operações
            } else {
                // Memória precisa existir
                if (memoryVariableIsValid(variables, memoryVariables)) {
                    if (operator.equals("LD")) {
                        accumulator = (variables.get(0).charAt(0) == 'T') || (variables.get(0).charAt(0) == 'C')
                                ? memoryVariables.get(variables.get(0)).endTimer
                                : memoryVariables.get(variables.get(0)).currentValue;
                    }

                    if (operator.equals("LDN")) {
                        accumulator = (variables.get(0).charAt(0) == 'T') || (variables.get(0).charAt(0) == 'C')
                                ? !memoryVariables.get(variables.get(0)).endTimer
                                : !memoryVariables.get(variables.get(0)).currentValue;
                    }

                    if (operator.equals("AND")) {
                        accumulator = (variables.get(0).charAt(0) == 'T') || (variables.get(0).charAt(0) == 'C')
                                ? (accumulator && memoryVariables.get(variables.get(0)).endTimer)
                                : (accumulator && memoryVariables.get(variables.get(0)).currentValue);
                    }

                    if (operator.equals("ANDN")) {
                        accumulator = (variables.get(0).charAt(0) == 'T') || (variables.get(0).charAt(0) == 'C')
                                ? (accumulator && !memoryVariables.get(variables.get(0)).endTimer)
                                : (accumulator && !memoryVariables.get(variables.get(0)).currentValue);
                    }

                    if (operator.equals("OR")) {
                        accumulator = (variables.get(0).charAt(0) == 'T') || (variables.get(0).charAt(0) == 'C')
                                ? (accumulator || memoryVariables.get(variables.get(0)).endTimer)
                                : (accumulator || memoryVariables.get(variables.get(0)).currentValue);
                    }

                    if (operator.equals("ORN")) {
                        accumulator = (variables.get(0).charAt(0) == 'T') || (variables.get(0).charAt(0) == 'C')
                                ? (accumulator || !memoryVariables.get(variables.get(0)).endTimer)
                                : (accumulator || !memoryVariables.get(variables.get(0)).currentValue);
                    }

                    // System.out.println(accumulator);
                    // System.out.println(inputs);
                    // System.out.println(outputs);
                    // System.out.println(memoryVariables);
                } else {
                    HomePg.showErrorMessage("Sintaxe incorreta! Variável " + variables.get(0) + " não existe!");
                }
            }
        } else {
            HomePg.showErrorMessage("Sintaxe incorreta! Operador " + operator + " não existe!");
        }

        // System.out.println(accumulator);
        return outputs;
    }
}
