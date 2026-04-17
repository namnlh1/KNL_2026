let currentExamQuestions = [];
let userSelections = {}; 

function renderExamList() {
    const listContainer = document.getElementById('exam-list');
    listContainer.innerHTML = EXAM_DATA.map(exam => `
        <div class="exam-card">
            <h3>${exam.name}</h3>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">Ngân hàng: ${exam.questions.length} câu</p>
            <div class="card-actions">
                <button class="btn-mode btn-standard" onclick="startExam('${exam.id}', 'standard')">🎯 Bài thi chuẩn (${exam.totalQuestions} câu)</button>
                <button class="btn-mode btn-mini" onclick="startExam('${exam.id}', 'mini')">⚡ Mini Test (10 câu)</button>
                <button class="btn-mode btn-full" onclick="startExam('${exam.id}', 'full')">📚 Full Test (Toàn bộ)</button>
            </div>
        </div>
    `).join('');
}

function startExam(examId, mode) {
    const exam = EXAM_DATA.find(e => e.id === examId);
    if (!exam) return;
    userSelections = {};
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    if (mode === 'standard') {
        const getByLvl = (lvl, count) => {
            const pool = exam.questions.filter(q => q.level === lvl || (lvl === 1 && q.level === "Dễ") || (lvl === 2 && q.level === "Trung bình") || (lvl === 3 && q.level === "Khó"));
            return shuffle(pool).slice(0, count);
        };
        currentExamQuestions = shuffle([...getByLvl(1, exam.counts.easy), ...getByLvl(2, exam.counts.medium), ...getByLvl(3, exam.counts.hard)]);
    } else if (mode === 'mini') {
        currentExamQuestions = shuffle(exam.questions).slice(0, 10);
    } else {
        currentExamQuestions = shuffle(exam.questions);
    }

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('current-exam-name').innerText = `${exam.name} (${mode.toUpperCase()})`;
    document.getElementById('exam-stats').innerText = `${currentExamQuestions.length} câu hỏi`;
    renderAllQuestions();
    window.scrollTo(0, 0);
}

function getAnswerCountLabel(q) {
    const correctAns = Array.isArray(q.answer) ? q.answer : q.answer.toString().split(',').map(Number);
    if (correctAns.length <= 1) return ""; 
    return `<span class="ans-count">(Chọn ${correctAns.length} đáp án)</span>`;
}

function renderAllQuestions() {
    const wrapper = document.getElementById('questions-wrapper');
    wrapper.innerHTML = currentExamQuestions.map((q, qIdx) => `
        <div class="question-card" id="q-card-${qIdx}">
            <div class="question-text">
                Câu ${qIdx + 1}: ${q.content}
                ${getAnswerCountLabel(q)}
            </div>
            <div class="options-container">
                ${q.options.map((opt, oIdx) => `
                    <div class="option-item" id="q-${qIdx}-o-${oIdx + 1}" onclick="handleSelect(${qIdx}, ${oIdx + 1}, '${q.type}')">
                        <strong>${String.fromCharCode(65 + oIdx)}.</strong> ${opt}
                    </div>
                `).join('')}
            </div>
            <div class="card-footer">
                <button class="hint-btn" onclick="toggleHint(${qIdx})">💡 Xem gợi ý</button>
                <div class="hint-box" id="hint-${qIdx}">Đáp án đúng: <strong>${formatAnswerText(q.answer)}</strong></div>
            </div>
        </div>
    `).join('');
}

function handleSelect(qIdx, optIdx, type) {
    if (!userSelections[qIdx]) userSelections[qIdx] = [];
    if (type === "SC") userSelections[qIdx] = [optIdx];
    else {
        const i = userSelections[qIdx].indexOf(optIdx);
        if (i > -1) userSelections[qIdx].splice(i, 1);
        else userSelections[qIdx].push(optIdx);
    }
    const card = document.getElementById(`q-card-${qIdx}`);
    card.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
    userSelections[qIdx].forEach(id => document.getElementById(`q-${qIdx}-o-${id}`).classList.add('selected'));
}

function submitExam() {
    let score = 0;
    currentExamQuestions.forEach((q, idx) => {
        const userAns = userSelections[idx] || [];
        const correctAns = Array.isArray(q.answer) ? q.answer : q.answer.toString().split(',').map(Number);
        const isCorrect = userAns.length === correctAns.length && userAns.every(v => correctAns.includes(v));
        if (isCorrect) score++;
        const card = document.getElementById(`q-card-${idx}`);
        card.querySelectorAll('.option-item').forEach((opt, oIdx) => {
            const val = oIdx + 1;
            opt.classList.remove('selected');
            if (correctAns.includes(val)) opt.classList.add('correct');
            else if (userAns.includes(val)) opt.classList.add('wrong');
        });
    });
    alert(`Kết quả: ${score}/${currentExamQuestions.length} câu đúng!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatAnswerText(ans) {
    const arr = Array.isArray(ans) ? ans : ans.toString().split(',').map(Number);
    return arr.map(i => String.fromCharCode(64 + i)).join(', ');
}

function toggleHint(idx) {
    const box = document.getElementById(`hint-${idx}`);
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function confirmExit() { if(confirm("Xác nhận thoát?")) location.reload(); }

document.addEventListener('DOMContentLoaded', renderExamList);