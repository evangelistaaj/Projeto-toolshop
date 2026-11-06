# language: pt
Funcionalidade: Login
  Como cliente da Toolshop
  Quero entrar na minha conta
  Para gerir o meu perfil e as minhas encomendas

  @sem-ci
  Cenário: Login com uma conta nova
    Dado que tenho uma conta registada
    E que estou na página de login
    Quando faço login com a conta registada
    Então vejo a página "My account"

  Cenário: Login com password errada
    Dado que estou na página de login
    Quando faço login com "utilizador-inexistente@teste.com" e "password-errada"
    Então vejo a mensagem de erro "Invalid email or password"
