package screens;

import Models.HomePageModel;
import ilcompiler.memoryvariable.MemoryVariable;
import java.awt.Color;
import java.awt.Component;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.TableCellRenderer;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.TableModel;
import javax.swing.table.TableRowSorter;
import java.util.List;
import java.util.ArrayList;
import javax.swing.RowSorter;
import javax.swing.SortOrder;
import java.util.Map;

public class ListaDeVariaveisPg extends javax.swing.JFrame {

    private JTable variablesTable;
    private DefaultTableModel tableModel;

    public ListaDeVariaveisPg() {
        initComponents();
        setupVariablesTable();
        setTitle("Monitor de Variáveis");
        this.setResizable(false);
    }

    public ListaDeVariaveisPg(Map<String, Boolean> inputs, Map<String, Boolean> outputs) {
        this();
        updateDataTable(inputs, outputs);
    }

    private void setupVariablesTable() {
        String[] columns = {"ID", "CurrentValue", "Counter", "MaxTimer", "EndTimer"};

        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false; // Impede edição direta das células
            }
        };

        variablesTable = new JTable(tableModel);
        
        TableRowSorter<TableModel> sorter = new TableRowSorter<>(tableModel);
        variablesTable.setRowSorter(sorter);

        List<RowSorter.SortKey> sortKeys = new ArrayList<>();
        // A coluna 0 é o ID
        sortKeys.add(new RowSorter.SortKey(0, SortOrder.ASCENDING));
        sorter.setSortKeys(sortKeys);
        sorter.sort();
        
        // Renderizador para colorir o estado (verde para TRUE, vermelho para FALSE)
        variablesTable.setDefaultRenderer(Object.class, new TableCellRenderer() {
            private final DefaultTableCellRenderer DEFAULT_RENDERER = new DefaultTableCellRenderer();

            @Override
            public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected, boolean hasFocus, int row, int column) {
                Component renderer = DEFAULT_RENDERER.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);

                if (column == 1 && value instanceof Boolean) {
                    renderer.setBackground((Boolean) value ? new Color(144, 238, 144) : new Color(255, 99, 71));
                    renderer.setForeground((Boolean) value ? Color.BLACK : Color.WHITE);
                } else {
                    renderer.setBackground(isSelected ? table.getSelectionBackground() : table.getBackground());
                    renderer.setForeground(isSelected ? table.getSelectionForeground() : table.getForeground());
                }
                return renderer;
            }
        });

        jScrollPane1.setViewportView(variablesTable);
    }

    public void updateDataTable(Map<String, Boolean> inputs, Map<String, Boolean> outputs) {
        tableModel.setRowCount(0); // Limpa todas as linhas

        for (Map.Entry<String, Boolean> entry : inputs.entrySet()) {
            tableModel.addRow(new Object[]{entry.getKey(), entry.getValue(), null, null, null}); // Adiciona ID e Estado com valores padrão para colunas restantes
        }
        for(Map.Entry<String, Boolean> entry : outputs.entrySet()){
            tableModel.addRow(new Object[]{entry.getKey(), entry.getValue(), null, null, null});
        }
        
        for (Map.Entry<String, MemoryVariable> entry : HomePageModel.getMemoryVariables().entrySet()) {
            switch (entry.getKey().charAt(0)) {
                case 'T' -> {
                    tableModel.addRow(new Object[]{entry.getKey(), entry.getValue().currentValue, 
                        entry.getValue().counter, entry.getValue().maxTimer, entry.getValue().endTimer});
                }
                case 'C' -> {
                    tableModel.addRow(new Object[]{entry.getKey(), "", entry.getValue().counter, 
                        entry.getValue().maxTimer, entry.getValue().endTimer});
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        jScrollPane1 = new javax.swing.JScrollPane();
        Lista_de_variaveis = new javax.swing.JTextArea();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);

        Lista_de_variaveis.setColumns(20);
        Lista_de_variaveis.setRows(5);
        jScrollPane1.setViewportView(Lista_de_variaveis);

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addGap(22, 22, 22)
                .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 371, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(25, Short.MAX_VALUE))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addGap(22, 22, 22)
                .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 423, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(27, Short.MAX_VALUE))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JTextArea Lista_de_variaveis;
    private javax.swing.JScrollPane jScrollPane1;
    // End of variables declaration//GEN-END:variables
}
