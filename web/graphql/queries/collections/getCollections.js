export const getCollections = `query getCollections($after:String){
    collections (first:250,after:$after){
      edges{
        node{
           
            handle
            
        }
      }
      pageInfo{
        hasNextPage
        endCursor
    }
    }
    
  }`;
