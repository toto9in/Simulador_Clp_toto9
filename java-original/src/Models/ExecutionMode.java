package Models;

public enum ExecutionMode {
    IDLE(1),
    STOPPED(2),
    RUNNING(3);

    private final int code;

    ExecutionMode(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static ExecutionMode fromCode(int code) {
        for (ExecutionMode mode : values()) {
            if (mode.getCode() == code) {
                return mode;
            }
        }
        return IDLE;
    }
}
