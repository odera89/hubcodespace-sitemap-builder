export const pagesCountQuery = `query pagesCount{
    collectionsCount {
        count
      }
      productsCount{
        count
      }
      pagesCount{
        count
      }
      blogs(first:250){
       edges{
        node{
            articlesCount{
                count
            }
        }
       }
      }
}`;
