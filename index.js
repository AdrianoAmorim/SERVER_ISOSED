const express = require('express')
const { PrismaClient, Prisma } = require('@prisma/client');
const app = express()
const cors = require('cors');
var moment = require('moment');
const prisma = new PrismaClient()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.listen(process.env.PORT || 4041, "0.0.0.0", () => {
  console.log("Servidor on!!")
})
//RETORNA OS ANIVERSARIANTES DO MES SELECIONADO
app.get('/aniversariantes', async (req, res) => {
  //inicia as variaveis com os dias inicial e final do mes
  var dataInicial = "-01";
  var dataFinal = "-0";
  //pega o mes escolhido pelo usuario
  const mes = req.query.mes
  //gera uma instancia da data atual
  const dataAtual = new Date();
  //pega o ano da instancia da data
  const anoAtual = dataAtual.getFullYear();
  //pega os dias desta data passada no parametro(colocando 0 retorna o total de dias)
  const data = new Date(anoAtual, mes, 0).getDate()
  //monta a data inicial com as informacoes obtida
  dataInicial = dataInicial.substring(0, 0) + anoAtual + "-" + mes + dataInicial

  //faz o teste pra saber quantos dias tem o mes escolhido..e monta a data final
  if (data == 31) {
    dataFinal = "-31"
    dataFinal = dataFinal.substring(0, 0) + anoAtual + "-" + mes + dataFinal
  } else if (data == 30) {
    dataFinal = "-30"
    dataFinal = dataFinal.substring(0, 0) + anoAtual + "-" + mes + dataFinal
  } else if (data == 27) {
    dataFinal = "-27"
    dataFinal = dataFinal.substring(0, 0) + anoAtual + "-" + mes + dataFinal
  } else if (data == 28) {
    dataFinal = "-28"
    dataFinal = dataFinal.substring(0, 0) + anoAtual + "-" + mes + dataFinal
  }
  const qtdMembro = await prisma.membros.findMany({
    where: {
      dtNascimento: {
        gte: new Date(dataInicial),
        lte: new Date(dataFinal),
      }
    },
    select: {
      id: true,
      nome: true,
      dtNascimento:true,
      cargo:{
        select:{
          nome:true
        }
      },
      congregacao: {
        select: {
          nome: true
        }
      }
    },
    orderBy: {
      nome: "asc"
    }

  })
  res.json(qtdMembro)
})

//BUSCA UMA LISTA DE MEMBROS FILTRANDO POR CARGO OU CONGREGACAO
app.get('/relatorio_membros_cargo', async (req, res) => {
  const idCargo = req.query.idCargo;
  try {
    const listaMembros = await prisma.membros.findMany({
      where: {
        id_cargo: parseInt(idCargo)
      },
      select: {
        id: true,
        nome: true,
        telefone:true,
        cargo:{
          select:{
            nome:true
          }
        },
        congregacao: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nome: "asc"
      }
    })
    res.json(listaMembros)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

app.get('/relatorio_membros_congregacao', async (req, res) => {
  const idCongregacao = req.query.idCongregacao;
  try {
    const listaMembros = await prisma.membros.findMany({
      where: {
        id_congregacao: parseInt(idCongregacao)
      },
      select: {
        id: true,
        nome: true, 
        telefone:true,
        cargo:{
          select:{
            nome:true
          }
        },
        congregacao: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nome: "asc"
      }
    })
    res.json(listaMembros)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//BUSCA A LISTA DE MEMBROS CADASTRADOS POR CARGO + CONGREGACOES
app.get('/relatorio_membros_congregacao_cargo', async (req, res) => {
  const id_cargo = req.query.idCargo;
  const id_congregacao = req.query.idCongregacao;
  try {
    const listaMembros = await prisma.membros.findMany({
      where: {
        AND: [{
          id_cargo: {
            equals: parseInt(id_cargo)
          }
        },
        {
          id_congregacao: {
            equals: parseInt(id_congregacao)
          }
        }]
      },
      select: {
        id: true,
        nome: true,
        telefone:true,
        cargo:{
          select:{
            nome:true
          }
        },
        congregacao: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nome: "asc"
      }
    })
    res.json(listaMembros)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//BUSCA A QUANTIDADE DE MEMBROS CADASTRADOS FILTRANDO POR CARGO E CONGREGACAO
app.get('/relatorio_qtdMembros_cargo_congregacao', async (req, res) => {
  const id_cargo = req.query.idCargo
  const id_congregacao = req.query.idCongregacao
  console.log(id_cargo)
  console.log(id_congregacao)
  try {
    const qtdMembros = await prisma.membros.count({
      where: {
        AND: [{
          id_cargo: {
            equals: parseInt(id_cargo)
          }
        },
        {
          id_congregacao: {
            equals: parseInt(id_congregacao)
          }
        }]
      },
      select: {
        _all: true
      },

    })
    res.json(qtdMembros)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//BUSCA A QUANTIDADE DE MEMBROS CADASTRADOS FILTRANDO POR CARGO
app.get('/relatorio_qtdMembros_cargo', async (req, res) => {
  const idCargo = req.query.id
  console.log(idCargo)
  try {
    const qtdMembro = await prisma.membros.count({
      where: {
        id_cargo: parseInt(idCargo)
      },
      select: {
        _all: true
      }
    })
    res.json(qtdMembro)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//BUSCA A QUANTIDADE DE MEMBROS CADASTRADOS FILTRANDO POR CONGREGACAO
app.get('/relatorio_qtdMembros_congregacao', async (req, res) => {
  const idCongregacao = req.query.id;
  try {
    const qtdMembro = await prisma.membros.count({
      where: {
        id_congregacao: parseInt(idCongregacao)
      },
      select: {
        _all: true
      }
    })
    res.json(qtdMembro)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//Busca a Quantidade de Membros Cadastrado
app.get('/relatorio_qtdMembros', async (req, res) => {
  try {
    const qtdMembro = await prisma.membros.count({
      select: {
        _all: true
      }
    })
    res.json(qtdMembro)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//Busca (ID,NOME,URLIMG, NOME CARGOS) DOS MEMBROS PARA LISTAR NA TELA HOME
app.get('/membros', async (req, res) => {

  try {
    const membros = await prisma.membros.findMany({
      select: {
        id: true,
        nome: true,
        url_foto: true,
        cargo: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nome: "asc"
      }
    });
    res.json(membros)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//BUSCAR CONGREGACAO OU CARGO NA CONFIGURAÇÃO
app.get('/buscarCongregacoes', async (req, res) => {
  const nomeItem = req.query.nome;
  try {
    const congregacoes = await prisma.congregacao.findMany({
      where: {
        nome: {
          startsWith: nomeItem,
          mode: 'insensitive'
        },
        id: {
          not: 1
        }
      },
      select: {
        id: true,
        nome: true
      },
      orderBy: {
        nome: "asc"
      }
    })
    res.json(congregacoes)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {

      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

app.get('/buscarCargos', async (req, res) => {
  const nomeItem = req.query.nome;
  try {
    const cargos = await prisma.cargo.findMany({
      where: {
        nome: {
          startsWith: nomeItem,
          mode: 'insensitive'
        },
        id: {
          not: 1
        }
      },
      select: {
        id: true,
        nome: true
      },
      orderBy: {
        nome: "asc"
      }
    })
    res.json(cargos)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {

      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//BUSCA OS MEMBROS NO CAMPO DE BUSCA DA HOME
app.get('/buscar', async (req, res) => {
  const nome = req.query.nome
  try {
    const membros = await prisma.membros.findMany({
      where: {
        nome: {
          startsWith: nome,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nome: true,
        url_foto: true,
        cargo: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nome: "asc"
      }
    });

    res.json(membros)
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {

      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})
//BUSCA TODOS OS CARGOS E CONGREGACOES EXISTENTES
app.get('/cargos', async (req, res) => {
  try {
    const cargos = await prisma.cargo.findMany({
      orderBy: {
        nome: "asc"
      }
    }

    );
    res.json(cargos);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})
app.get('/congregacoes', async (req, res) => {
  try {
    const congregacoes = await prisma.congregacao.findMany({
      orderBy: {
        nome: "asc"
      }
    });
    res.json(congregacoes);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})
//Busca TODOS OS CARGOS ou congregacoes EXISTENTES exceto a id1 Default
app.get('/configCargos', async (req, res) => {
  try {
    const cargos = await prisma.cargo.findMany({
      where: {
        id: {
          not: 1
        }
      },
      orderBy: {
        nome: "asc"
      }
    }

    );
    res.json(cargos);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

app.get('/configCongregacoes', async (req, res) => {
  try {
    const congregacoes = await prisma.congregacao.findMany({
      where: {
        id: {
          not: 1
        }
      },
      orderBy: {
        nome: "asc"
      }
    });
    res.json(congregacoes);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//Busca O MEMBRO SELECIONADO PELO ID
app.get("/membro/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const membro = await prisma.membros.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        logradouro: {
          select: {
            endereco: true,
            numero: true,
            bairro: true,
            cidade: true
          }
        },
        cargo: {
          select: {
            nome: true
          }
        },
        congregacao: {
          select: {
            nome: true
          }
        }
      }
    })
    res.json(membro)
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
      console.log(e)
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
});

//CADASTRAR NOVO cargo
app.post('/cadCargo', async (req, res) => {
  const cargo = req.body
  try {
    const response = await prisma.cargo.create({
      data: {
        nome: cargo.nome
      },
      select: {
        id: true
      }
    })
    res.json(response)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
});

//CADASTRAR NOVA CONGREGAÇÃO
app.post('/cadCongregacao', async (req, res) => {
  const congregacao = req.body
  try {
    const response = await prisma.congregacao.create({
      data: {
        nome: congregacao.nome
      },
      select: {
        id: true
      }
    })
    res.json(response)

  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
});

//CADASTRAR NOVO MEMBRO
app.post('/cadastrar', async (req, res) => {
  const membro = req.body
  var nascimento = moment(membro.dtNascimento).format("YYYY-MM-DD")
  var batismo = moment(membro.dtBatismoo).format("YYYY-MM-DD")
  var dtNascimento = new Date(nascimento)
  var dtBatismo = new Date(batismo);

  try {
    const response = await prisma.logradouro.create({
      data: {
        endereco: membro.endereco,
        numero: membro.numero,
        bairro: membro.bairro,
        cidade: membro.cidade,
        membros: {
          create: {
            nome: membro.nome,
            telefone: membro.telefone,
            pai: membro.pai,
            mae: membro.mae,
            dtNascimento: dtNascimento,
            dtBatismo: dtBatismo,
            estCivil: membro.estCivil,
            id_cargo: membro.id_cargo,
            id_congregacao: membro.id_congregacao,
            url_foto: membro.url_foto ? membro.url_foto : undefined
          }
        }
      },
      select: {
        id: true
      }
    })
    res.json(response)
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }

})

//ATUALIZAR OS  DADOS DO MEMBRO 
app.put('/atualizar', async (req, res) => {
  const membro = req.body
  var nascimento = moment(membro.dtNascimento).format("YYYY-MM-DD")
  var batismo = moment(membro.dtBatismo).format("YYYY-MM-DD")
  var dtNascimento = new Date(nascimento)
  var dtBatismo = new Date(batismo);
  try {
    const response = await prisma.logradouro.update({
      where: {
        id: parseInt(membro.id_logradouro)
      },
      data: {
        endereco: membro.endereco,
        numero: membro.numero,
        bairro: membro.bairro,
        cidade: membro.cidade,
        membros: {
          update: {
            where: {
              id: membro.id,
            },
            data: {
              nome: membro.nome,
              telefone: membro.telefone,
              pai: membro.pai,
              mae: membro.mae,
              dtNascimento: dtNascimento,
              dtBatismo: dtBatismo,
              estCivil: membro.estCivil,
              id_cargo: membro.id_cargo,
              id_congregacao: membro.id_congregacao,
              url_foto: membro.url_foto ? membro.url_foto : undefined
            }
          }
        }
      },
      select: {
        id: true
      }

    })
    res.json(response)
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//ATUALIZAR O CARGO E A CONGREGACAO
app.put('/atualizarCongregacao', async (req, res) => {
  const congregacao = req.body
  try {
    const response = await prisma.congregacao.update({
      where: {
        id: parseInt(congregacao.id)
      },
      data: {
        nome: congregacao.nome
      },
      select: {
        id: true
      }
    })
    res.json(response)
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

app.put('/atualizarCargo', async (req, res) => {
  const cargo = req.body
  try {
    const response = await prisma.cargo.update({
      where: {
        id: parseInt(cargo.id)
      },
      data: {
        nome: cargo.nome
      },
      select: {
        id: true
      }
    })
    res.json(response)
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

//DELETAR CARGO E CONGREGACAO
app.delete('/deletarCongregacao', async (req, res) => {
  const id = req.body
  var responseConsulta = null;
  var resultFor = null;
  try {
    responseConsulta = await prisma.membros.findMany({
      where: {
        id_congregacao: parseInt(id.id_congregacao)
      },
      select: {
        id: true
      }
    });
    if (responseConsulta.length > 0) {
      for (var i = 0; i < responseConsulta.length; i++) {
        resultFor = await prisma.membros.update({
          where: {
            id: parseInt(responseConsulta[i].id)
          },
          data: {
            id_congregacao: 1
          },
          select: {
            id: true
          }

        })
      }
      if (resultFor.id > 0) {
        responseConsulta = await prisma.congregacao.delete({
          where: {
            id: parseInt(id.id_congregacao)
          },
          select: {
            id: true
          }
        })
      } else {
        res.json({ msg: "Erro ao Atualizar a Congregação deste Membro" })
      }
    } else {
      responseConsulta = await prisma.congregacao.delete({
        where: {
          id: parseInt(id.id_congregacao)
        },
        select: {
          id: true
        }

      })
    }
    res.json(responseConsulta)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})

app.delete('/deletarCargo', async (req, res) => {
  const id = req.body
  var responseConsulta = null;
  var resultFor = null;
  try {
    responseConsulta = await prisma.membros.findMany({
      where: {
        id_cargo: parseInt(id.id_cargo)
      },
      select: {
        id: true
      }
    });
    if (responseConsulta.length > 0) {
      for (var i = 0; i < responseConsulta.length; i++) {
        resultFor = await prisma.membros.update({
          where: {
            id: parseInt(responseConsulta[i].id)
          },
          data: {
            id_cargo: 1
          },
          select: {
            id: true
          }

        })
      }
      if (resultFor.id > 0) {
        responseConsulta = await prisma.cargo.delete({
          where: {
            id: parseInt(id.id_cargo)
          },
          select: {
            id: true
          }
        })
      } else {
        res.json({ msg: "Erro ao Atualizar os Cargos dos Membros" })
      }
    } else {
      responseConsulta = await prisma.cargo.delete({
        where: {
          id: parseInt(id.id_cargo)
        },
        select: {
          id: true
        }

      })
    }
    res.json(responseConsulta)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})


//DELETAR O MEMBRO ESCOLHIDO 
app.delete('/deletar', async (req, res) => {
  const ids = await req.body
  try {
    let response = await prisma.membros.delete({
      where: {
        id: parseInt(ids.id_membro)
      },
      select: {
        id: true
      }

    })
    response = await prisma.logradouro.delete({
      where: {
        id: parseInt(ids.id_logradouro)
      },
      select: {
        id: true
      }
    })
    res.json(response)
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.json({ error: true, msg: "Erro de sintaxe ou campo Obrigatório Vazio!!" })
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      res.json({ error: true, msg: "Erro de Conexão com o Banco de Dados!!" })
    } else {
      res.json({ error: true, msg: e })
    }
  }
})
