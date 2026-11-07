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

  Cenário: Login com utilizador inexistente
    Dado que estou na página de login
    Quando faço login com "utilizador-inexistente@teste.com" e "password-errada"
    Então vejo a mensagem de erro "Invalid email or password"

  @so-local
  Cenário: Login com password errada
    Dado que tenho uma conta registada
    E que estou na página de login
    Quando faço login com a conta registada e a password "Password-Errada1!"
    Então vejo a mensagem de erro "Invalid email or password"

  @so-local
  Cenário: Conta bloqueada após 3 tentativas falhadas
    Dado que tenho uma conta registada
    E que estou na página de login
    Quando falho o login 3 vezes com a conta registada
    E faço login com a conta registada
    Então vejo a mensagem de erro "Account locked, too many failed attempts. Please contact the administrator."
