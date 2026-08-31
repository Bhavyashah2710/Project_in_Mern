let allArticles = [];
let currentIndex = 0;
const batchSize = 24;
let debounceTimer;

function getUser(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://saurav.tech/NewsAPI/top-headlines/category/health/in.json');
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(null, xhr.responseText);
        } else {
            callback("server error", null);
        }
    };
    xhr.onerror = function () {
        callback("Network error", null);
    };
    xhr.send();
}

// navi news 
function renderNextBatch() {
    const container = document.getElementById('newsContainer');
    
  
    const nextArticles = allArticles.slice(currentIndex, currentIndex + batchSize);
    
    nextArticles.forEach(article => {
        const item = document.createElement('div');
        item.className = 'news-item';

        item.onclick = function() {
            openModal(article);
        };

        const img = document.createElement('img');
        img.src = article.urlToImage || 'https://via.placeholder.com/300x140?text=No+Image';
        img.alt = article.title || 'News image';
        item.appendChild(img);

        const title = document.createElement('h3');
        title.textContent = article.title || 'No title';
        item.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = article.description || 'No description available.';
        item.appendChild(desc);

        const meta = document.createElement('div');
        meta.className = 'meta';
        const sourceName = article.source && article.source.name ? article.source.name : 'Unknown source';
        const publishedAt = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '';
        meta.textContent = sourceName + (publishedAt ? ' • ' + publishedAt : '');
        item.appendChild(meta);

        container.appendChild(item);
    });

    currentIndex += batchSize;
}


function openModal(article) {
    const modal = document.getElementById('newsModal');
    document.getElementById('modalImg').src = article.urlToImage || 'https://via.placeholder.com/500x250?text=No+Image';
    document.getElementById('modalTitle').textContent = article.title || 'No Title Available';
    
    const sourceName = article.source && article.source.name ? article.source.name : 'Unknown Source';
    const publishedAt = article.publishedAt ? new Date(article.publishedAt).toLocaleString() : '';
    document.getElementById('modalMeta').textContent = sourceName + (publishedAt ? ' | ' + publishedAt : '');
    
    document.getElementById('modalDesc').textContent = article.description || 'No description available.';
    document.getElementById('modalContent').textContent = article.content || '';
    
    const realBtn = document.getElementById('modalRealLink');
    if (article.url) {
        realBtn.href = article.url;
        realBtn.style.display = 'inline-block';
    } else {
        realBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
}


document.getElementById('closeModal').onclick = function() {
    document.getElementById('newsModal').style.display = 'none';
};


window.onclick = function(event) {
    const modal = document.getElementById('newsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};


window.onscroll = function() {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
            if (currentIndex < allArticles.length) {
                renderNextBatch();
            }
        }
    }, 500); 
};
getUser((err, data) => {
    if (err) {
        console.error(err);
        document.getElementById('newsContainer').textContent = 'Failed to load news.';
        return;
    }
    const parsed = JSON.parse(data);
    allArticles = parsed.articles || [];
    renderNextBatch(); 
});
