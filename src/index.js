import ApiService from './services/apiService';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btn: document.querySelector('.load-more'),
};

const apiService = new ApiService();

refs.form.addEventListener('submit', onSubmit);
refs.btn.addEventListener('click', fetchPictures);

hide(refs.btn);

function onSubmit(e) {
  e.preventDefault();
  const serchQuery = e.currentTarget.elements.searchQuery.value.trim();
  if (serchQuery === '') {
    alert('empty query!!!');
    return;
  }
  apiService.setSearchQuery(serchQuery);
  clearGallery();
  hide(refs.btn);

  fetchPictures().finally(() => {
    refs.form.reset();
  });
}

async function createMarkup() {
  try {
    const { hits, total, totalHits } = await apiService.getPictures();
    console.log(`Hooray! We found ${totalHits} images.`);
    console.log(hits);
    if (totalHits === 0) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    const maxPage = Math.ceil(totalHits / 40);
    const nextPage = apiService.page;
    if (nextPage > maxPage) {
      hide(refs.btn);
      console.log("We're sorry, but you've reached the end of search results.");
    } else show(refs.btn);
    return hits.reduce((markup, hit) => markup + createCardMarkup(hit), '');
  } catch (error) {
    onError(error);
  }
}

async function fetchPictures() {
  try {
    const markup = await createMarkup();
    if (markup === undefined) {
      throw new Error('Not found');
    }
    appendToGallery(markup);
  } catch (error) {
    onError(error);
  }
}

function createCardMarkup({
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card">
  <img src=${largeImageURL} alt=${tags} loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes 9${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>`;
}

function appendToGallery(markup) {
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  refs.gallery.innerHTML = ' ';
}

function onError(err) {
  console.error(err);
}

function hide(el) {
  el.classList.add('hide');
}

function show(el) {
  el.classList.remove('hide');
}
