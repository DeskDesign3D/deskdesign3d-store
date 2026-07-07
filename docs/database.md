# Database

## Tables

profiles

- id
- email
- first_name
- last_name
- role

categories

- id
- name

products

- id
- category_id
- name
- description
- price
- stock
- active

product_images

- id
- product_id
- image_url
- storage_path
- sort_order

favorites

- id
- user_id
- product_id

reviews

- id
- product_id
- user_id
- rating
- comment

carts

- id
- user_id

cart_items

- id
- cart_id
- product_id
- quantity

addresses

- id
- user_id
- first_name
- last_name
- street
- postal_code
- city
- country

orders

- id
- user_id
- address_id
- status
- payment_method
- payment_status
- subtotal
- shipping
- total

order_items

- id
- order_id
- product_id
- quantity
- price
