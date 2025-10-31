package screens;

import javax.swing.*;
import javax.swing.event.HyperlinkEvent;
import javax.swing.event.HyperlinkListener;
import java.awt.Desktop;
import java.net.URI;



public class SobrePopup {

    public static void mostrarSobre() {
        String htmlContent = """
            <html>
                <body style='font-family:sans-serif; font-size:10px;'>
                    <h3>Participantes do Projeto</h3>
                    <b>Membros do Último Grupo</b><br>
                    - Diogo Nunes<br>
                    - José Arantes<br>
                    - Vinicius Barbosa<br>
                    - Yuri Duarte<br><br>

                    <b>Membros do Penúltimo Grupo</b><br>
                    - Bruno Rodrigues<br>
                    - Iasmin Pieraço<br>
                    - Igor Vendramini<br>
                    - Peterson<br>
                    - Vinicius Patrick<br><br>

                    <b>Repositórios do Projeto:</b><br>
                    - <a href='https://github.com/Emanuelle-Oliveira/compilador-il-clp'>Repositório Inicial</a><br>
                    - <a href='https://github.com/IasminPieraco/Trabalho-Final-CLP'>Penúltimo Repositório</a><br>
                    - <a href='https://github.com/Diogo-NB/SimuladorClp'>Último Repositório</a><br><br>

                    <i>Devido à dificuldade em contatar todos os membros que participaram do projeto,<br>
                    nem todos os repositórios e desenvolvedores foram citados.</i>
                </body>
            </html>
            """;

        JEditorPane editorPane = new JEditorPane("text/html", htmlContent);
        editorPane.setEditable(false);
        editorPane.setOpaque(false);

        // Habilita clique nos links
        editorPane.addHyperlinkListener(new HyperlinkListener() {
            public void hyperlinkUpdate(HyperlinkEvent e) {
                if (e.getEventType() == HyperlinkEvent.EventType.ACTIVATED) {
                    try {
                        Desktop.getDesktop().browse(new URI(e.getURL().toString()));
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                }
            }
        });

        // Scroll para caso tenha muito conteúdo
        JScrollPane scrollPane = new JScrollPane(editorPane);
        scrollPane.setPreferredSize(new java.awt.Dimension(450, 300));

        JOptionPane.showMessageDialog(null, scrollPane, "Sobre o Projeto", JOptionPane.INFORMATION_MESSAGE);
    }
}
