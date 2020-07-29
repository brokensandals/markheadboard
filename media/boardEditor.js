(function() {
  const vscode = acquireVsCodeApi();
  let dragging = null;

  function handleSectionClick(event) {
    let target = event.target;
    while (typeof target.dataset.start === 'undefined') {
      target = target.parentElement;
    }
    vscode.postMessage({
      type: 'open',
      start: parseInt(target.dataset.start, 10),
      heading: target.dataset.heading,
    });
  }

  function handleDragStart(event) {
    if (event.target.classList.contains('card')) {
      dragging = { type: 'card' };
    } else if (event.target.classList.contains('column')) {
      dragging = { type: 'column' };
    } else {
      dragging = null;
      return;
    }
    dragging.start = parseInt(event.target.dataset.start);
    dragging.heading = event.target.dataset.heading;
  }

  function handleDragEnd(event) {
    for (const el of document.getElementsByClassName('drag-over')) {
      el.classList.remove('drag-over');
    }
  }

  function handleDragEnter(event) {
    event.target.closest(`.${dragging.type}`).classList.add('drag-over');
  }

  function handleDragLeave(event) {
    event.target.classList.remove('drag-over');
  }

  function handleDrop(event) {
    
  }

  function addSectionListeners(element) {
    element.addEventListener('click', handleSectionClick);
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
  }

  function updateCard(section, card) {
    card.className = 'card';
    card.innerText = section.heading || '[UNTITLED]';
    card.dataset.start = section.start;
    card.dataset.heading = section.heading;
    card.draggable = true;
  }

  function updateColumn(section, column) {
    column.className = 'column';
    column.dataset.start = section.start;
    column.dataset.heading = section.heading;
    column.draggable = true;

    const columnHeadings = column.getElementsByClassName('column-name');
    let columnHeading;
    if (columnHeadings.length) {
      columnHeading = columnHeadings[0];
    } else {
      columnHeading = document.createElement('h1');
      columnHeading.className = 'column-name';
      columnHeading.addEventListener('dragenter', handleDragEnter);
      columnHeading.addEventListener('dragleave', handleDragLeave);
      column.appendChild(columnHeading);
    }
    columnHeading.innerText = section.heading || '[UNTITLED]';

    const cardsContainers = column.getElementsByClassName('cards');
    let cardsContainer;
    if (cardsContainers.length) {
      cardsContainer = cardsContainers[0];
    }
    else {
      cardsContainer = document.createElement('ul');
      cardsContainer.className = 'cards';
      column.appendChild(cardsContainer);
    }

    const cards = cardsContainer.getElementsByClassName('card');
    let index = 0;

    while (index < section.children.length && index < cards.length) {
      updateCard(section.children[index], cards[index]);
      index += 1;
    }

    while (index < section.children.length) {
      const card = document.createElement('li');
      updateCard(section.children[index], card);
      addSectionListeners(card);
      cardsContainer.appendChild(card);
      index += 1;
    }

    while (index < cards.length) {
      cards[index].remove();
    }
  }

  function updateColumns(root) {
    const columnsContainer = document.getElementById('columns');
    const columns = columnsContainer.getElementsByClassName('column');
    let index = 0;

    while (index < root.children.length && index < columns.length) {
      updateColumn(root.children[index], columns[index]);
      index += 1;
    }

    while (index < root.children.length) {
      const column = document.createElement('section');
      updateColumn(root.children[index], column);
      addSectionListeners(column);
      columnsContainer.appendChild(column);
      index += 1;
    }

    while (index < columns.length) {
      columns[index].remove();
    }
  }

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'refresh':
        const { root } = message;
        updateColumns(root);
        vscode.setState({ root });
        break;
    }
  });

  const state = vscode.getState();
  if (state) {
    updateColumns(state.root);
  }
}());
