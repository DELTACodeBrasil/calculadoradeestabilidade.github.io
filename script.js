let chart;

function obterValor(id) {
    const el = document.getElementById(id);
    return el && el.value ? parseFloat(el.value) : 0;
}

function calcular() {
    // ===== LEITURA DOS DADOS (CG) =====
    const mNariz = obterValor('mNariz');
    const xNariz = obterValor('xNariz');
    const mCorpo = obterValor('mCorpo');
    const xCorpo = obterValor('xCorpo');
    const mMotor = obterValor('mMotor');
    const xMotor = obterValor('xMotor');
    const mEmpenas = obterValor('mEmpenas');
    const xEmpenas = obterValor('xEmpenas');

    const somaMx = mNariz * xNariz + mCorpo * xCorpo + mMotor * xMotor + mEmpenas * xEmpenas;
    const massaTotal = mNariz + mCorpo + mMotor + mEmpenas;
    const CG = massaTotal > 0 ? somaMx / massaTotal : 0;

    // ===== LEITURA DOS DADOS (EMPENAS) =====
    const a = obterValor('a');
    const b = obterValor('b');
    const m = obterValor('m');
    const N = obterValor('N');
    const d = obterValor('d');
    const yfo = obterValor('yfo');
    const Ln = obterValor('Ln');

    // Área trapezoidal
    const S = ((a + b) / 2) * m;

    // Comprimento médio da empena
    const l = Math.sqrt(Math.pow((a - b) / 2, 2) + Math.pow(m, 2));

    // Coeficiente do nariz (Barrowman)
    const Cn = 2;
    const yn = 0.5 * Ln;

    // Coeficiente de força normal das empenas
    let Cf = 0;
    if (d > 0) {
        Cf = (4 * N * (S / (d * d))) /
             (1 + Math.sqrt(1 + Math.pow((2 * l / (a + b)), 2)));
    }

    // Posição do CP das empenas
    const yf = yfo + (m / 3) * ((a + 2 * b) / (a + b));

    // Fator de interferência
    const k = d > 0 ? (2 * (S / d)) / (1 + (2 * (S / d))) : 0;

    // Centro de Pressão total
    const CP = (Cn * yn + k * Cf * yf) / (Cn + k * Cf);

    // Margem estática
    const E = d > 0 ? (CP - CG) / d : 0;

    // Classificação textual (sem emojis)
    let classificacao = '';
    if (E > 1) classificacao = 'Estável (Alta Margem)'; 
    else if (E > 0) classificacao = 'Marginalmente Estável';
    else classificacao = 'Instável';

    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `
        CG: ${CG.toFixed(2)} mm<br>
        CP: ${CP.toFixed(2)} mm<br>
        Margem estática (E): ${E.toFixed(3)}<br>
        <span style="color: #ffaa66;">${classificacao}</span>
    `;

    atualizarGrafico(CG, CP);
    desenharFoguete(CG, CP);
}

function atualizarGrafico(CG, CP) {
    const ctx = document.getElementById('grafico').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Centro de Gravidade (CG)', 'Centro de Pressão (CP)'],
            datasets: [{
                label: 'Posição (mm)',
                data: [CG, CP],
                backgroundColor: ['#ff7b7b', '#7bb0ff'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#1e3b5c' } }
            }
        }
    });
}

function desenharFoguete(CG, CP) {
    const canvas = document.getElementById('fogueteCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 200);

    // Corpo do foguete
    ctx.fillStyle = '#e0e0f0';
    ctx.fillRect(50, 80, 600, 40);

    // Nariz
    ctx.beginPath();
    ctx.moveTo(50, 80);
    ctx.lineTo(20, 100);
    ctx.lineTo(50, 120);
    ctx.closePath();
    ctx.fillStyle = '#aaaaff';
    ctx.fill();

    // CG (vermelho)
    ctx.fillStyle = '#ff5555';
    ctx.beginPath();
    ctx.arc(50 + CG, 100, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // CP (azul)
    ctx.fillStyle = '#5588ff';
    ctx.beginPath();
    ctx.arc(50 + CP, 100, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const resultadoTexto = document.getElementById('resultado').innerText;

    doc.setFont('courier', 'normal');
    doc.setFontSize(16);
    doc.text('Relatório técnico de estabilidade', 20, 20);

    doc.setFontSize(12);
    doc.text('Projeto de Foguete – Método de Barrowman', 20, 30);
    doc.text('Calculadora de Estabilidade', 20, 38);

    doc.line(20, 45, 190, 45); // linha separadora

    let linhas = resultadoTexto.split('\n');
    let y = 55;
    linhas.forEach(linha => {
        doc.text(linha.trim(), 20, y);
        y += 8;
    });

    doc.line(20, y + 5, 190, y + 5);
    doc.text('Sistema desenvolvido para a Olimpíada Brasileira de Foguetes (OBAFOG)', 20, y + 18);
    doc.text('© 2026 DELTA CODE BRASIL - Arthur Oliveiro', 20, y + 28);

    doc.save('Relatorio_Estabilidade_OBAFOG_ArthurOliveiro.pdf');
}
