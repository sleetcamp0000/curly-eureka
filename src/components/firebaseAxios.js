import axios from 'axios';
import * as u from './utils';
// import { baseURL } from '../firebaseConfig';

const firebaseAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

export default firebaseAxios;