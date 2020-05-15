         ___        ______     ____ _                 _  ___  
        / \ \      / / ___|   / ___| | ___  _   _  __| |/ _ \ 
       / _ \ \ /\ / /\___ \  | |   | |/ _ \| | | |/ _` | (_) |
      / ___ \ V  V /  ___) | | |___| | (_) | |_| | (_| |\__, |
     /_/   \_\_/\_/  |____/   \____|_|\___/ \__,_|\__,_|  /_/ 
 ----------------------------------------------------------------- 
 
 Create the S3 bucket
 
 ```
 aws s3 mb s3://hash.twitter.bank --region us-west-2
 ```
 Create the package
 
 ```
 sam package --output-template-file packaged.yaml --s3-bucket <S3-destnation-bucket-name>
 ```
 
 Deploy the package
 
 ```
 sam deploy --template-file ./packaged.yaml --stack-name <Stack-name> --s3-bucket <S3-destnation-bucket-name> --capabilities CAPABILITY_IAM --parameter-overrides TwitterHashtagParam=<Your target hash tag>
 ```
 
 
 