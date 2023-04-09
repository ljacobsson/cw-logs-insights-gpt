'use strict';

const monaco = require('monaco-editor')
let editor;
const interval = setInterval(() => {
  const iframe = document.getElementById('microConsole-Logs');
  if (iframe) {
    clearInterval(interval);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (!node.parentElement) {
              continue;
            }
            let textContent = node.parentElement.textContent;
            if (!node.classList || !node.classList.contains('view-line')) {
              continue;
            }
            if (textContent.startsWith('"')) {
              if (iframe.contentWindow.document.getElementsByClassName('submit-button-clone').length > 0) {
                continue;
              }

              //find element by innerText
              let submitButton = iframe.contentWindow.document.evaluate('//span[text()="Run query"]', iframe.contentWindow.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
              submitButton = getNodeParent(submitButton, 3);
              const clone = submitButton.cloneNode(true);
              clone.firstChild.firstChild.innerText = "Convert to query"
              clone.addEventListener('click', () => {
                const editor = iframe.contentWindow.document.getElementsByClassName('view-lines')[0];
                const query = editor.innerText;

                const logGroupMatch = location.href.match(/~source~\((.+?)\)/);
                let service;
                if (logGroupMatch.length > 1) {
                  const logGroups = logGroupMatch[1].split("~'").map((logGroup) => {
                    return logGroup.replace(/\*([0-9a-f]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
                  });
                  const awsLogGroup = logGroups.find((logGroup) => logGroup.startsWith('/aws/'));
                  if (awsLogGroup) {
                    service = awsLogGroup.split('/')[2];
                  } else {
                    console.log("No AWS log group found");
                  }
                }

                chrome.runtime.sendMessage(
                  {
                    type: 'QUERY',
                    payload: {
                      query: editor.innerText + (service ? ` in the context of ${service}` : ''),
                    },
                  },
                  (response) => {
                    if (response.message.includes('```')) {
                      response.message = response.message.split('```')[1].replace(/\n/, '');
                    }

                    const encoded = response.message.replace(/[^a-zA-Z0-9\|]/g, c => {
                      const char = c.charCodeAt(0).toString(16);
                      if (char.length === 1)
                        return `*0${char}`;
                      return `*${char}`;
                    });
                    console.log(encoded);
                    let url = location.href;
                    url = url.replace(/editorString~'(.+?)~/, `editorString~'${encoded}~`);
                    location.href = url;
                    setTimeout(() => {
                      if (editor.innerText === query) {
                        location.reload();
                      }
                    }, 500);
                  }
                );
              });
              clone.classList.add('submit-button-clone');
              submitButton.parentNode.insertBefore(clone, submitButton.nextSibling);
            } else {
              const clone = iframe.contentWindow.document.getElementsByClassName('submit-button-clone')[0];
              if (clone) {
                clone.remove();
              }
            }
          }
        }
      }
    });
    const iframeInterval = setInterval(() => {
      if (iframe.contentWindow) {
        clearInterval(iframeInterval);
        observer.observe(iframe.contentWindow.document.body, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
    }, 1000);

  }
}, 1000);

function getNodeParent(node, level) {
  if (level === 0) {
    return node;
  }
  return getNodeParent(node.parentElement, level - 1);
}
