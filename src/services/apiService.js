import axios from 'axios';
const API_KEY = '37177948-5246bdbd194b518a4b536ba26';
export default class ApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.maxPage = 1;
  }
  async getPictures() {
    const url = `https://pixabay.com/api/?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`;
    const res = await axios.get(url);
    this.incrementPage();
    return res.data;
  }
  setSearchQuery(newValue) {
    this.searchQuery = newValue;
    this.resetPage();
  }
  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  setMaxPage(maxPage) {
    this.maxPage = maxPage;
  }
}
