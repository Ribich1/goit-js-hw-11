import ApiService from './services/apiService';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btn: document.querySelector('.load-more'),
};

const apiService = new ApiService();

const simlelightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

refs.form.addEventListener('submit', onSubmit);
refs.btn.addEventListener('click', fetchPictures);
window.addEventListener('scroll', handleScroll);

hide(refs.btn);

function onSubmit(e) {
  e.preventDefault();
  const serchQuery = e.currentTarget.elements.searchQuery.value.trim();
  if (serchQuery === '') {
    Notiflix.Notify.warning('empty query!!!');
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
    // Notiflix.Notify.success(`${total}`);
    if (totalHits === 0) {
      return;
    }
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    const maxPage = Math.ceil(totalHits / 40);
    const nextPage = apiService.page;
    apiService.setMaxPage(maxPage);
    if (nextPage > maxPage) {
      hide(refs.btn);
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
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    appendToGallery(markup);
    simlelightbox.refresh();
    if (apiService.page > apiService.maxPage) {
      throw new Error(
        "We're sorry, but you've reached the end of search results."
      );
    }
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
  webformatURL,
}) {
  return `<div class="photo-card" uk-lightbox>
<a href=${largeImageURL}><img src=${webformatURL} alt="${tags}" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
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
  Notiflix.Notify.failure(err.message);
}

function hide(el) {
  el.classList.add('hide');
}

function show(el) {
  el.classList.remove('hide');
}

function handleScroll() {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    fetchPictures();
  }
}
