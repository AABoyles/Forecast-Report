questions = {};

/* update by
let questions = {};
function getNext(category, page){
  fetch(`https://pandemic.metaculus.com/api2/questions/?search=cat:${category}&order_by=-publish_time&page=${page}`).then(r => r.json().then(d => {
    questions[category] = questions[category].concat(d.results);
    if(questions[category].length < d.count) getNext(category, ++page);
  }));
}
['clinical-science', 'economy-business', 'global-epidemiology', 'government-policy', 'medical-interventions', 'social-political-impact', 'testing-tracking'].forEach(category => {
  questions[category] = [];
  getNext(category, 1);
});
*/

function updateQuestions(){
  document.querySelector('#content').innerHTML = '';
  let status = document.querySelector('#status').value;
  if(status == "open") updateOpen();
  if(status == "resolved") updateResolved();
  document.querySelector('#footer').innerHTML = "Report Generated " + Date();
}

function updateOpen(){
  let category = document.querySelector('#category').value;
  questions[category].filter(q => q.resolution == null).slice(0,4).forEach(q => {
    let wrapper = document.createElement('div');
    wrapper.className = "row";

    let embed = document.createElement('iframe');
    embed.src = `//d3s0w6fek99l5b.cloudfront.net/s/5/questions/embed/${q.id}/`;
    embed.name = q.id;
    embed.width = 800;
    embed.height = 220;
    wrapper.appendChild(embed);

    let oldNotes = localStorage.getItem(q.id);

    let annotate = document.createElement('a');
    annotate.innerHTML = "Add Notes";
    annotate.className = "annotate";
    if(oldNotes) annotate.className = "hidden";
    annotate.addEventListener('click', e => {
      e.target.className = "hidden";
      e.target.nextSibling.className = "visible";
    });
    wrapper.appendChild(annotate);

    let notes = document.createElement('textarea');
    notes.placeholder = "Enter notes here";
    if(oldNotes){
      notes.value = oldNotes;
      notes.className = "visible";
    }
    notes.addEventListener('change', e => localStorage.setItem(q.id, e.target.value));
    wrapper.appendChild(notes);

    document.querySelector('#content').appendChild(wrapper);
  });
}

function updateResolved(){
  let category = document.querySelector('#category').value;
  let subset = questions[category].filter(q => q.resolution != null);
  let wrapper = document.createElement('div');
  wrapper.innerHTML = `
    Pandemic Metaculus has resolved ${subset.length} questions in the
    <a href="https://pandemic.metaculus.com/questions/?search=cat:${category}">
    ${document.querySelector('#category').selectedOptions[0].innerText} category</a>:
    ${subset.filter(q => q.possibilities.type == 'binary').length} binary and
    ${subset.filter(q => q.possibilities.type == 'continuous').length} continuous.
    Of these...`;
  document.querySelector('#content').appendChild(wrapper);

  subset.slice(0,4).forEach(q => {
    let wrapper = document.createElement('div');
    wrapper.className = "row";
    
    let opened = new Date(q.publish_time);
    let resolved = new Date(q.resolve_time);
    let days = Math.round((resolved - opened)/1000/60/60/24);

    let embed = document.createElement('div');
    embed.className = "resolved";
    embed.innerHTML = `
      <h1><a href="https://pandemic.metaculus.com${q.page_url}">${q.title}</a></h1>
      <hr>
      <span class="opened">Published on ${opened.toISOString().substring(0,10)}</span>
      <span class="resolved">Resolved on ${resolved.toISOString().substring(0,10)}</span>
      <span class="datediff">It was open for ${days} days.</span>${days < 31 ? "&nbsp;<span class='badge red'>Short Fuse</span>" : ""}
    `;
    wrapper.appendChild(embed);

    let oldNotes = localStorage.getItem(q.id);

    let annotate = document.createElement('a');
    annotate.innerHTML = "Add Notes";
    annotate.className = "annotate";
    if(oldNotes) annotate.className = "hidden";
    annotate.addEventListener('click', e => {
      e.target.className = "hidden";
      e.target.nextSibling.className = "visible";
    });
    wrapper.appendChild(annotate);

    let notes = document.createElement('textarea');
    notes.placeholder = "Enter notes here";
    if(oldNotes){
      notes.value = oldNotes;
      notes.className = "visible";
    }
    notes.addEventListener('change', e => localStorage.setItem(q.id, e.target.value));
    wrapper.appendChild(notes);
    
    document.querySelector('#content').appendChild(wrapper);
  });
}

document.querySelector('#category').addEventListener('change', updateQuestions);
document.querySelector('#status').addEventListener('change', updateQuestions);

fetch('data.json').then(data => data.json().then(q => {
	questions = q;
	updateQuestions();
}));
