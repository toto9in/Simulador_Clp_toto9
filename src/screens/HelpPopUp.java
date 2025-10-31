package screens;

import java.awt.Desktop;
import java.net.URI;
import javax.swing.JEditorPane;
import javax.swing.JOptionPane;
import javax.swing.JScrollPane;
import javax.swing.event.HyperlinkEvent;
import javax.swing.event.HyperlinkListener;

public class HelpPopUp {

    public static void showHelp() {
        String htmlContent = """
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #ffffff;
                color: #333333;
                padding: 15px;
                font-size: 12px;
                line-height: 1.5;
            }
            h3 {
                color: #000000;
                font-size: 14px;
                margin-top: 20px;
                border-bottom: 1px solid #cccccc;
                padding-bottom: 5px;
            }
            ul {
                list-style: none;
                padding-left: 0;
                margin-top: 8px;
            }
            li {
                padding: 6px 8px;
                margin-bottom: 4px;
                background-color: #f9f9f9;
                border: 1px solid #dddddd;
                border-radius: 4px;
                font-size: 12px;
            }
            strong {
                color: #000000;
                font-weight: bold;
            }
            a {
                color: #000000;
                text-decoration: underline;
                font-weight: normal;
            }
            a:hover {
                color: #555555;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666666;
            }
        </style>
    </head>
    <body>
        <h3>Lista de Instruções</h3>
        <ul>
            <li><strong>LD:</strong> Load – Carrega um valor para o acumulador.</li>
            <li><strong>LDN:</strong> Load Negado – Carrega um valor negado para o acumulador.</li>
            <li><strong>ST:</strong> Store – Armazena o conteúdo do acumulador no local especificado.</li>
            <li><strong>STN:</strong> Store Negado – Armazena o conteúdo negado do acumulador no local especificado.</li>
            <li><strong>AND:</strong> AND – Função booleana AND entre o operando indicado e o valor do acumulador.</li>
            <li><strong>ANDN:</strong> AND Negado – Função booleana AND entre o operando indicado negado e o valor do acumulador.</li>
            <li><strong>OR:</strong> OR – Função booleana OR entre o operando indicado e o valor do acumulador.</li>
            <li><strong>ORN:</strong> OR Negado – Função booleana OR entre o operando indicado negado e o valor do acumulador.</li>
            <li><strong>TON:</strong> Temporizador ON Delay – Ativa após um intervalo de tempo definido.</li>
            <li><strong>TOF:</strong> Temporizador OFF Delay – Desativa após um intervalo de tempo definido.</li>
            <li><strong>CTU:</strong> Count Up – Contador crescente.</li>
            <li><strong>CTD:</strong> Count Down – Contador decrescente.</li>
            <li><strong>T1, T2, T3...:</strong> Temporizadores – Referências aos temporizadores específicos.</li>
            <li><strong>I0.0, I1.7, I1.0...:</strong> Entradas – Endereços das entradas do sistema.</li>
            <li><strong>Q0.1, Q1.7, Q1.0...:</strong> Saídas – Endereços das saídas do sistema.</li>
            <li><strong>M1, M2, M3...:</strong> Memórias – Memórias booleanas locais disponíveis.</li>
        </ul>
            <h3>Explicação/Exemplos</h3>
            <div class="footer">
            🎥 <a href='https://www.youtube.com/watch?v=e-C53fbtbfo'>Vídeo Complementar</a>
            <br>
            <br>
            💻 <a href=' https://github.com/Diogo-NB/SimuladorClp/tree/master/examples '>Códigos de Exemplo</a>
            </div>
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

        JOptionPane.showMessageDialog(null, scrollPane, "Ajuda", JOptionPane.INFORMATION_MESSAGE);
    }
}
