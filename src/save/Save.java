/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package save;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

public class Save {

    public static void save(String name, List<String> memory) throws IOException {
        FileWriter arq = new FileWriter(name + ".txt");
        PrintWriter gravarArq = new PrintWriter(arq);

        for (int i = 0; i < memory.size(); i++) {
            gravarArq.printf(memory.get(i));
        }

        arq.close();
        // System.out.println("arquivo salvo");
    }

    public static List<String> load(String name) throws IOException {
        BufferedReader buffRead = new BufferedReader(new FileReader(name));
        List<String> texto = new ArrayList<>();
        String linha = "";
        while (true) {
            if (linha != null) {
                if (linha != "")
                    texto.add(linha);
            } else
                break;
            linha = buffRead.readLine();
        }
        buffRead.close();

        return texto;
    }

}
