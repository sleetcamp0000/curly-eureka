import axios from 'axios';
const herokuRequest = axios.create({ baseURL: 'https://be-jazz-pomme-rouge.herokuapp.com/' })
// const herokuRequest = axios.create({ baseURL: 'http://localhost:9090' })


export const fetchThumbs = (newestIdLastSession, token) => {
  return herokuRequest.get(`/thumbs`, {
    params: {
      newest_id_last_session: newestIdLastSession,
      token: token
    }
  }).then(res => {
    console.log(res.data.herokuMsg)
    return res
    // console.log(res.data, ' <-- data in FE api.js');
    // console.log(res.status, ' <-- status in FE api.js');
    // return res;
  }).catch(err => {
    // console.log('reaching ???? catch block')
    // return err;
  });
};

export const fetchPost = (postId, token) => {
  return herokuRequest.get(`/post/${postId}`, {
    params: {
      token: token
    }
  }).then(res => res); // do you need to do this then? does .get not just return out the response?
};

export const fetchArtistThumbs = (artist, mostRecentId = null, token) => {
  return herokuRequest.get(`/artist`, {
    params: {
      artist_name: artist,
      most_recent_id: mostRecentId,
      token: token
    }
  }).then(res => {
    console.log(res.data, '  //////////////////////////////////////')
    return res
    // console.log(res.data, ' <-- data in FE api.js');
    // console.log(res.status, ' <-- status in FE api.js');
    // return res;
  }).catch(err => {
    // console.log('reaching ???? catch block')
    // return err;
  });
};

export const fetchArtistMostRecentId = (artist, token) => {
  return herokuRequest.get(`/artist/mostRecentId`, {
    params: {
      artist_name: artist,
      token: token
    }
  }).then(res => {
    return res;
  }).catch(err => {
    // console.log('reaching ???? catch block')
    // return err;
  });
};


