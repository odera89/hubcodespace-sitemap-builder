export const getProducts = `query getProducts($after:String){
    products (first:250,after:$after){
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
