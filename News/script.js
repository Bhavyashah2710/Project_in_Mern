let allArticles = [];
let currentIndex = 0;
const batchSize = 12;
let isFetching = false;

const newsContainer = document.getElementById('newsContainer');
const newsModal = document.getElementById('newsModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalDesc = document.getElementById('modalDesc');
const modalContent = document.getElementById('modalContent');
const modalRealLink = document.getElementById('modalRealLink');
const closeModalBtn = document.getElementById('closeModal');

function getUser(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://saurav.tech/NewsAPI/top-headlines/category/health/in.json');
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(null, xhr.responseText);
        } else {
            callback('Server error', null);
        }
    };
    xhr.onerror = function () {
        callback('Network error', null);
    };
    xhr.send();
}

function renderNextBatch() {
    if (!allArticles || allArticles.length === 0) {
        isFetching = false;
        return;
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < batchSize; i++) {
        const article = allArticles[currentIndex % allArticles.length];
        currentIndex++;

        const item = document.createElement('div');
        item.className = 'news-item';

        item.onclick = function () {
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

        fragment.appendChild(item);
    }

    newsContainer.appendChild(fragment);

    setTimeout(() => {
        isFetching = false;
    }, 150);
}

function openModal(article) {
    modalImg.src = article.urlToImage || 'https://via.placeholder.com/500x250?text=No+Image';
    modalTitle.textContent = article.title || 'No Title Available';

    const sourceName = article.source && article.source.name ? article.source.name : 'Unknown Source';
    const publishedAt = article.publishedAt ? new Date(article.publishedAt).toLocaleString() : '';
    modalMeta.textContent = sourceName + (publishedAt ? ' | ' + publishedAt : '');

    modalDesc.textContent = article.description || 'No description available.';
    modalContent.textContent = article.content || '';

    if (article.url) {
        modalRealLink.href = article.url;
        modalRealLink.style.display = 'inline-block';
    } else {
        modalRealLink.style.display = 'none';
    }

    newsModal.style.display = 'flex';
}

closeModalBtn.onclick = function () {
    newsModal.style.display = 'none';
};

window.onclick = function (event) {
    if (event.target === newsModal) {
        newsModal.style.display = 'none';
    }
};

function handleScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    const totalHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
    );

    if (scrollPosition + windowHeight >= totalHeight - 500) {
        if (!isFetching) {
            isFetching = true;
            renderNextBatch();
        }
    }
}

window.addEventListener('scroll', handleScroll, { passive: true });

getUser((err, data) => {
    if (err) {
        console.error(err);
        newsContainer.textContent = 'Failed to load news.';
        return;
    }
    const parsed = JSON.parse(data);
    allArticles = parsed.articles || [];
    renderNextBatch();
});
