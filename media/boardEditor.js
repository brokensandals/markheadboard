(function() {
  const vscode = acquireVsCodeApi();
  let root = null;

  function handleSectionClick(event) {
    const columnSec = root.children[parseInt(event.target.closest('.column').dataset.index, 10)];
    const message = { type: 'open' };
    const card = event.target.closest('.card');
    if (card) {
      const cardSec = columnSec.children[parseInt(card.dataset.index, 10)];
      message.start = cardSec.start;
      message.heading = cardSec.heading;
    } else {
      message.start = columnSec.start;
      message.heading = columnSec.heading;
    }
    vscode.postMessage(message);
  }

  function handleCardMove(event) {
    const sourceColumnSec = root.children[parseInt(event.dragged.closest('.column').dataset.index, 10)];
    const sourceCardSec = sourceColumnSec.children[parseInt(event.dragged.dataset.index, 10)];
    const destColumnSec = root.children[parseInt(event.related.closest('.column').dataset.index, 10)];
    const destCard = event.related.closest('.card');
    const message = {
      type: 'move',
      sourceStart: sourceCardSec.start,
      sourceEnd: sourceCardSec.end,
    };
    if (destCard) {
      const destCardSec = destColumnSec.children[parseInt(destCard.dataset.index, 10)];
      if (event.willInsertAfter) {
        message.dest = destCardSec.end;
      } else {
        message.dest = destCardSec.start;
      }
    } else {
      message.dest = destColumnSec.end;
    }
    vscode.postMessage(message);
  }

  function addSectionListeners(element) {
    element.addEventListener('click', handleSectionClick);
  }

  function updateCard(section, card) {
    card.className = 'card';
    card.innerText = section.heading || '[UNTITLED]';
    card.dataset.index = section.index;
  }

  function updateColumn(section, column) {
    column.className = 'column';
    column.dataset.index = section.index;

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
    } else {
      cardsContainer = document.createElement('ul');
      cardsContainer.className = 'cards';
      column.appendChild(cardsContainer);
      new Sortable(cardsContainer, {
        animation: 150,
        group: 'cards',
        onMove: handleCardMove,
      });
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

  function updateColumns() {
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
        root = message.root;
        updateColumns(root);
        vscode.setState({ root });
        break;
    }
  });

  const state = vscode.getState();
  if (state) {
    root = state.root;
    updateColumns();
  }
}());
