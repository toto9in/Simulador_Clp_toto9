package ilcompiler.input;

// Classe entrada
public class Input {

    String id;
    Boolean currentValue;

    public Input(String id, Boolean currentValue) {
        this.id = id;
        this.currentValue = currentValue;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Boolean getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Boolean currentValue) {
        this.currentValue = currentValue;
    }

    @Override
    public String toString() {
        return "Input{" + "id=" + id + ", currentValue=" + currentValue + '}';
    }

    public enum InputType {
        SWITCH(0),
        NO(1),
        NC(2);

        private final int value;

        public int getValue() {
            return value;
        }

        InputType(int value) {
            this.value = value;
        }

        public static InputType fromValue(int value) {
            for (InputType type : InputType.values()) {
                if (type.value == value) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Invalid InputType value: " + value);
        }
    }
}
