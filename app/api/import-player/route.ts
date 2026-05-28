import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "Nenhuma imagem fornecida." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Chave da API do Gemini não configurada." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Você é um assistente especializado em extrair dados de fichas de personagens de RPG (D&D 5e e similares).
O usuário forneceu ${images.length} imagem(ns) da sua ficha de personagem. Analise as imagens e extraia as seguintes informações em formato JSON, seguindo EXATAMENTE esta estrutura (omita campos se não encontrar):
{
  "name": "string (Nome do personagem)",
  "playerName": "string (Nome do jogador, se houver)",
  "classLevel": "string (Classe e nível, ex: Guerreiro 3)",
  "race": "string (Raça)",
  "str": "string (Valor do atributo Força, ex: 15)",
  "dex": "string",
  "con": "string",
  "int": "string",
  "wis": "string",
  "cha": "string",
  "hpMax": number (Pontos de vida máximos, ex: 25),
  "ac": "string (Classe de Armadura, ex: 16)",
  "init": "string (Iniciativa, ex: +2)",
  "speed": "string (Deslocamento, ex: 9m ou 30ft)",
  "perc": "string (Percepção Passiva, ex: 12)",
  "hdTotal": "string (Dado de Vida Total, ex: 3d10)",
  "profBonus": "string (Bônus de Proficiência, ex: 2)",
  "attacks": [
    { "name": "string (Nome da Arma)", "bonus": "string (Bônus)", "dmg": "string (Dano/Tipo)" }
  ],
  "saves": [
    "string (Exatamente e somente: FOR, DES, CON, INT, SAB ou CAR)"
  ],
  "skills": [
    "string (Use exatamente os nomes: Acrobacia (Des), Arcanismo (Int), Atletismo (For), Atuação (Car), Enganação (Car), Furtividade (Des), História (Int), Intimidação (Car), Intuição (Sab), Investigação (Int), Lidar c/ Animais (Sab), Medicina (Sab), Natureza (Int), Percepção (Sab), Persuasão (Car), Prestidigitação (Des), Religião (Int), Sobrevivência (Sab))"
  ]
}

NÃO extraia magias. Construa o JSON estritamente com os inputs definidos acima, sem adicionar novas chaves.

Responda APENAS com o JSON válido, sem nenhum texto extra e sem formatação markdown de bloco de código (\`\`\`json). O retorno deve ser parseável diretamente via JSON.parse().`;

    const parts = [
      prompt,
      ...images.map((base64Image: string) => {
        // Remover prefixo do data URL se existir (ex: data:image/png;base64,)
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        // Tentar inferir o tipo de imagem ou assumir jpeg
        let mimeType = "image/jpeg";
        if (base64Image.startsWith("data:image/png")) mimeType = "image/png";
        else if (base64Image.startsWith("data:image/webp")) mimeType = "image/webp";
        
        return {
          inlineData: {
            data: base64Data,
            mimeType
          }
        };
      })
    ];

    const result = await model.generateContent(parts);
    const response = await result.response;
    let textResult = response.text();
    
    // Limpar possíveis formatações markdown que o modelo ainda possa retornar
    textResult = textResult.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsedData = JSON.parse(textResult);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON retornado pelo Gemini:", textResult);
      return NextResponse.json({ error: "Ocorreu um erro ao extrair os dados da ficha." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Erro na importação via Gemini:", error);
    return NextResponse.json({ error: error.message || "Erro interno no servidor." }, { status: 500 });
  }
}
