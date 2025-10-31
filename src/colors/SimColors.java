package colors;
import java.awt.Color;

public class SimColors {
    // public static final Color vermelho = new Color(255, 0, 0);
    public static final Color corPrimaria = new Color(20, 110, 250);
    public static final Color corSecundaria = new Color(10, 100, 130);
    public static final Color corBackground = new Color(224, 224, 224);
    public static final Color corText = new Color(0, 0, 0);
    public static final Color branco = new Color(255, 255, 255);

    public static Color corOpacidade(Color cor, int alpha) {
        return new Color(cor.getRed(), cor.getGreen(), cor.getBlue(), alpha);
    }
}
