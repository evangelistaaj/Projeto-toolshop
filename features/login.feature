# language: pt
Funcionalidade: Login
  Como cliente da Toolshop
  Quero entrar na minha conta
  Para gerir o meu perfil e as minhas encomendas

  Cenário: Login com utilizador válido
    Dado que estou na página de login
    Quando faço login com "customer@practicesoftwaretesting.com" e "welcome01"
    Então vejo a página "My account"

  Cenário: Login com password errada
    Dado que estou na página de login
    Quando faço login com "customer@practicesoftwaretesting.com" e "password-errada"
    Então vejo a mensagem de erro "Invalid email or password"
