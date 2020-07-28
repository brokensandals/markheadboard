(function() {
  const vscode = acquireVsCodeApi();

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

  function updateCard(section, card) {
    card.className = 'card';
    card.innerText = section.heading || '[UNTITLED]';
    card.dataset.start = section.start;
    card.dataset.heading = section.heading;
  }

  function updateColumn(section, column) {
    column.className = 'column';
    column.dataset.start = section.start;
    column.dataset.heading = section.heading;

    const columnHeadings = column.getElementsByClassName('column-name');
    let columnHeading;
    if (columnHeadings.length) {
      columnHeading = columnHeadings[0];
    } else {
      columnHeading = document.createElement('h1');
      columnHeading.className = 'column-name';
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
      card.addEventListener('click', handleSectionClick);
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
      column.addEventListener('click', handleSectionClick);
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
