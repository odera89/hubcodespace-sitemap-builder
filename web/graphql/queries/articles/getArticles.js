export const getArticles = `query getArticles($after:String){
   articles (first:250,after:$after){
      edges{
        node{
           
            handle
            blog{
              handle
            }
        }
      }
      pageInfo{
        hasNextPage
        endCursor
    }
    }
    
  }`;
