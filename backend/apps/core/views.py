from django.http import HttpResponse


def api_root(request):
    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Resta API</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, sans-serif; background: #f9fafb; color: #111; padding: 2rem; }
  .container { max-width: 800px; margin: 0 auto; }
  h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
  .subtitle { color: #6b7280; margin-bottom: 2rem; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
  th { background: #f9fafb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 600; }
  td { font-size: 0.875rem; font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace; }
  .method { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; min-width: 4rem; text-align: center; }
  .get { background: #dbeafe; color: #1d4ed8; }
  .post { background: #d1fae5; color: #059669; }
  .patch { background: #fef3c7; color: #d97706; }
  .delete { background: #fee2e2; color: #dc2626; }
  a { color: #111; text-decoration: none; }
  a:hover { color: #2563eb; }
  td:last-child { color: #6b7280; font-family: sans-serif; font-size: 0.8rem; }
  tr:last-child td { border-bottom: none; }
  .admin-badge { font-size: 0.65rem; background: #f3f4f6; color: #6b7280; padding: 0.125rem 0.375rem; border-radius: 3px; margin-left: 0.375rem; }
</style>
</head>
<body>
<div class="container">
  <h1>Resta API</h1>
  <p class="subtitle">Restaurant management backend</p>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><span class="method get">GET</span></td><td><a href="/admin/">/admin/</a></td><td>Django Admin <span class="admin-badge">staff only</span></td></tr>
      <tr><td><span class="method post">POST</span></td><td><a href="/api/auth/register/">/api/auth/register/</a></td><td>Create account</td></tr>
      <tr><td><span class="method post">POST</span></td><td>/api/auth/login/</td><td>Get JWT tokens (email + password)</td></tr>
      <tr><td><span class="method post">POST</span></td><td>/api/auth/refresh/</td><td>Refresh JWT token</td></tr>
      <tr><td><span class="method get">GET</span></td><td><a href="/api/auth/me/">/api/auth/me/</a></td><td>Current user &amp; profile</td></tr>
      <tr><td><span class="method get">GET</span></td><td><a href="/api/menu/categories/">/api/menu/categories/</a></td><td>All categories with items</td></tr>
      <tr><td><span class="method get">GET</span></td><td><a href="/api/menu/items/">/api/menu/items/</a></td><td>Menu items (filterable)</td></tr>
      <tr><td><span class="method get">GET</span></td><td>/api/menu/items/{slug}/</td><td>Menu item detail</td></tr>
      <tr><td><span class="method get">GET</span></td><td>/api/menu/modifiers/</td><td>Available modifiers</td></tr>
      <tr><td><span class="method get">GET</span></td><td><a href="/api/cart/">/api/cart/</a></td><td>Current cart</td></tr>
      <tr><td><span class="method post">POST</span></td><td>/api/cart/add/</td><td>Add item to cart</td></tr>
      <tr><td><span class="method delete">DEL</span></td><td>/api/cart/clear/</td><td>Clear cart</td></tr>
      <tr><td><span class="method patch">PATCH</span></td><td>/api/cart/items/{id}/</td><td>Update cart item quantity</td></tr>
      <tr><td><span class="method delete">DEL</span></td><td>/api/cart/items/{id}/</td><td>Remove cart item</td></tr>
      <tr><td><span class="method post">POST</span></td><td>/api/orders/checkout/</td><td>Place order (dummy payment)</td></tr>
      <tr><td><span class="method get">GET</span></td><td><a href="/api/orders/">/api/orders/</a></td><td>Order history</td></tr>
      <tr><td><span class="method get">GET</span></td><td>/api/orders/{id}/</td><td>Order detail</td></tr>
      <tr><td><span class="method patch">PATCH</span></td><td>/api/orders/{id}/status/</td><td>Update order status <span class="admin-badge">staff</span></td></tr>
      <tr><td><span class="method get">GET</span></td><td><a href="/api/tables/">/api/tables/</a></td><td>List tables <span class="admin-badge">staff</span></td></tr>
      <tr><td><span class="method post">POST</span></td><td>/api/tables/</td><td>Create table <span class="admin-badge">staff</span></td></tr>
      <tr><td><span class="method get">GET</span></td><td><a href="/api/reservations/">/api/reservations/</a></td><td>List reservations</td></tr>
      <tr><td><span class="method post">POST</span></td><td>/api/reservations/</td><td>Create reservation</td></tr>
      <tr><td><span class="method get">GET</span></td><td>/api/reservations/my/</td><td>My reservations</td></tr>
      <tr><td><span class="method get">GET</span></td><td>/api/reservations/availability/?date=&amp;party_size=</td><td>Check table availability</td></tr>
    </tbody>
  </table>
</div>
</body>
</html>"""
    return HttpResponse(html)
