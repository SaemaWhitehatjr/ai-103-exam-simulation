// Shared helpers for the AI-103 practice simulation.
// Progress is stored in localStorage so index.html can show a checkmark
// on completed questions. Works when the folder is served from a web
// server (recommended) - some browsers restrict localStorage on file://.

function markComplete(qid){
  try{
    const done = JSON.parse(localStorage.getItem('ai103_done') || '[]');
    if(!done.includes(qid)){
      done.push(qid);
      localStorage.setItem('ai103_done', JSON.stringify(done));
    }
  }catch(e){ /* storage unavailable, ignore */ }
}

function showTab(groupId, tabId, btn){
  document.querySelectorAll('#' + groupId + ' .tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#' + groupId + ' .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btn.classList.add('active');
}

// Single-answer multiple choice
function checkMCQ(qid, name, correctValue, correctLabel, explanationHtml){
  const options = document.getElementsByName(name);
  let selected = null;
  for(const opt of options){ if(opt.checked) selected = opt.value; }

  const resultDiv = document.getElementById('result');
  if(!selected){
    resultDiv.style.display = 'block';
    resultDiv.className = 'result incorrect';
    resultDiv.innerHTML = 'Please select an answer before submitting.';
    return;
  }

  resultDiv.style.display = 'block';
  if(selected === correctValue){
    resultDiv.className = 'result correct';
    resultDiv.innerHTML = '<strong>&#10003; Correct!</strong><div class="explanation"><strong>Correct answer: ' + correctLabel + '</strong><br><br>' + explanationHtml + '</div>';
  }else{
    resultDiv.className = 'result incorrect';
    resultDiv.innerHTML = '<strong>Incorrect.</strong><div class="explanation"><strong>Correct answer: ' + correctLabel + '</strong><br><br>' + explanationHtml + '</div>';
  }
  Array.from(options).forEach(o=>o.disabled=true);
  markComplete(qid);
}

// Multi-select (choose N)
function checkMultiSelect(qid, name, correctValues, explanationHtml){
  const options = Array.from(document.getElementsByName(name));
  const selected = options.filter(o=>o.checked).map(o=>o.value).sort();
  const correct = [...correctValues].sort();
  const resultDiv = document.getElementById('result');

  if(selected.length === 0){
    resultDiv.style.display = 'block';
    resultDiv.className = 'result incorrect';
    resultDiv.innerHTML = 'Please select your answer(s) before submitting.';
    return;
  }

  resultDiv.style.display = 'block';
  const isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
  if(isCorrect){
    resultDiv.className = 'result correct';
    resultDiv.innerHTML = '<strong>&#10003; Correct!</strong><div class="explanation">' + explanationHtml + '</div>';
  }else{
    resultDiv.className = 'result incorrect';
    resultDiv.innerHTML = '<strong>Incorrect.</strong><div class="explanation">' + explanationHtml + '</div>';
  }
  options.forEach(o=>o.disabled=true);
  markComplete(qid);
}

// Hotspot / dropdown style
function checkHotspot(qid, fieldIds, correctMap, explanationHtml){
  let allCorrect = true;
  const rows = [];
  fieldIds.forEach(id=>{
    const el = document.getElementById(id);
    const val = el.value;
    const ok = val === correctMap[id].value;
    if(!ok) allCorrect = false;
    rows.push({label: correctMap[id].label, answer: correctMap[id].display});
    el.disabled = true;
  });

  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'block';

  let answerList = rows.map(r => r.label + ': <strong>' + r.answer + '</strong>').join('<br>');

  if(allCorrect){
    resultDiv.className = 'result correct';
    resultDiv.innerHTML = '<strong>&#10003; Correct!</strong><div class="explanation"><strong>Correct configuration:</strong><br>' + answerList + '<br><br>' + explanationHtml + '</div>';
  }else{
    resultDiv.className = 'result incorrect';
    resultDiv.innerHTML = '<strong>Incorrect.</strong><div class="explanation"><strong>Correct configuration:</strong><br>' + answerList + '<br><br>' + explanationHtml + '</div>';
  }
  markComplete(qid);
}

// Generic handler: reads the question's answer data from a
// <script type="application/json" id="qdata"> block so we never have to
// hand-escape quotes into an inline onclick attribute.
function handleSubmit(){
  const qd = JSON.parse(document.getElementById('qdata').textContent);
  if(qd.type === 'mcq'){
    const correctLabel = qd.correct + '. ' + qd.optionLabels[qd.correct];
    checkMCQ(qd.id, qd.id, qd.correct, correctLabel, qd.explanation);
  } else if(qd.type === 'multi'){
    checkMultiSelect(qd.id, qd.id, qd.correct, qd.explanation);
  } else if(qd.type === 'hotspot'){
    checkHotspot(qd.id, qd.fieldIds, qd.correctMap, qd.explanation);
  }
}
