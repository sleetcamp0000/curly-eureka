import { encrypt, decrypt } from 'react-crypt-gsm';
import firebaseAxios from './firebaseAxios.js';

export const encryptToJSON = string => {
  const encryptedText = encrypt(string);
  const encryptedTextAsJson = JSON.stringify(encryptedText);
  return encryptedTextAsJson
};

export const decryptFromJSON = encryptedTextAsJson => {
  const encryptedTextDeJasonified = JSON.parse(encryptedTextAsJson);
  const objRebuffered = {
    content: encryptedTextDeJasonified.content,
    tag: Buffer.from(encryptedTextDeJasonified.tag)
  };
  const decryptedText = decrypt(objRebuffered);
  return decryptedText;
};

export const getAndDecryptTagsFromFB = (token) => {
  const d = decryptFromJSON;

  const decryptDesiredTags = collection => {
    const transformedArrOfTags = collection.map(tagObj => {
      let transformedTagObj = {};
      transformedTagObj.type = tagObj.type;
      transformedTagObj.tag = d(tagObj.tag);
      tagObj.dependants ? transformedTagObj.dependants = tagObj.dependants.map(el => d(el)) : transformedTagObj.dependants = null;
      return transformedTagObj
    });
    return transformedArrOfTags;
  };

  const decryptDisallowedTags = collection => {
    const transformedArrOfTags = collection.map(tagObj => {
      let transformedTagObj = {};
      transformedTagObj.tag = d(tagObj.tag);
      transformedTagObj.isArtist = tagObj.isArtist;
      return transformedTagObj;
    });
    return transformedArrOfTags;
  };

  return new Promise((resolve, reject) => {
    try {
      return firebaseAxios.get(`/tags.json?auth=${token}`).then(({ data }) => {
        const returnedArrOfDesired = Object.values(data.desiredTags)[0];
        const returnedArrOfDisallowed = Object.values(data.disallowedTags)[0];
        const decryptedDesired = decryptDesiredTags(returnedArrOfDesired);
        const decryptedDisallowed = decryptDisallowedTags(returnedArrOfDisallowed);
        return resolve({ tags: { decryptedDesired, decryptedDisallowed } });
      }).catch(err => console.log('💩'))
    } catch (e) {
      console.log('🧟‍♀️')
    }
  });
};

export const decryptPosts = (objectOfPosts) => {
  const decryptedPosts = Object.values(objectOfPosts).map(obj => {
    const decryptedPostTags = obj.postTags.map(tag => decryptFromJSON(tag));
    const decryptedThumbURL = decryptFromJSON(obj.thumbURL);
    let decryptedMatchingOn;
    obj.matchingOn ? decryptedMatchingOn = obj.matchingOn.map(tag => decryptFromJSON(tag)) : decryptedMatchingOn = null;
    return {
      ...obj, postTags: decryptedPostTags, thumbURL: decryptedThumbURL, matchingOn: decryptedMatchingOn
    }
  });
  return decryptedPosts;
};

export const sortObjectsByName = (arrOfDesiredTags) => {
  return arrOfDesiredTags.sort((a, b) => (a.tag > b.tag) ? 1 : ((b.tag > a.tag) ? -1 : 0))
}

export const sortStringsByName = (arrOfDisallowedTags) => {
  return arrOfDisallowedTags.sort((a, b) => (a > b) ? 1 : ((b > a) ? -1 : 0))
}

export const fetchDecryptedPageOfPosts = (firebaseEndpoint, statePosts, token) => {
  console.log(firebaseEndpoint, ' <-- fetchDecryptedPageOfPosts')
  return new Promise((resolve, reject) => {
    try {
      return firebaseAxios.get(`${firebaseEndpoint}?auth=${token}`).then(({ data }) => {
        if (data !== null) {
          const { isLastPage, posts } = Object.values(data)[0]
          const allPostsSorted = ([...decryptPosts(posts), ...statePosts]).sort((a, b) => Number(b.postId) - Number(a.postId));
          return resolve({ isLastPage, allPostsSorted, reqError: false });
        } else {
          console.log('Nothing on the request FB page_ currently!')
          return resolve({ isLastPage: null, allPostsSorted: null, reqError: true })
        };
      }).catch(err => { console.log('💩'); console.log(err) })
    } catch (e) {
      console.log('🧟‍♀️')
    }
  });
}

// export const addNewTagObjectsAndDeleteAnyOldOnes = (desiredTagData, disallowedTagData) => {

// }


// artists .
// baseURLs
// likes .
// newestIdLastSession
// sessionStorage
// tags