export const getPages = `query PageList($after:String){
    pages (first:250,after:$after){
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
