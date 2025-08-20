import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { log } from 'console';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Requête Prolog manquante' },
        { status: 400 }
      );
    }

    // Créer un fichier temporaire séparé pour la requête
    const tempQueryFile = path.join(process.cwd(), 'temp_query.pl');
    // Générer le code Prolog qui consulte le vrai prolog.pl et exécute la requête
    const prologCode = `
  :- use_module(library(http/json)).
  :- consult('prolog.pl').
  
  main :-
    catch(
      execute_query,
      Error,
      (
        json_write(current_output, _{success: false, error: "Exception occurred", details: Error}),
        halt
      )
    ).
  
  execute_query :-
    ${query.includes('is_guilty') ? `
    (${query} ->
      json_write(current_output, _{success: true, result: true}) ;
      json_write(current_output, _{success: true, result: false})
    )` : query.includes('explain_guilt') ? `
    ${query.replace('Evidence', 'Ev')} ->
      json_write(current_output, _{success: true, result: _{evidence: Ev}}) ;
      json_write(current_output, _{success: false, error: "No explanation found"})` : query.includes('find_all_guilty') ? `
    ${query.replace('Suspects', 'Susp')} ->
      json_write(current_output, _{success: true, result: _{suspects: Susp}}) ;
      json_write(current_output, _{success: false, error: "No guilty suspects found"})` : `
    json_write(current_output, _{success: false, error: "Unknown query type"})`},
    halt.
`;
    console.log('Exécution de la requête Prolog:', prologCode);

    await writeFile(tempQueryFile, prologCode);

    // Exécuter la requête Prolog en utilisant le fichier temporaire
    const { stdout, stderr } = await execAsync(`swipl -q -f ${tempQueryFile} -t main`);

    // Nettoyer le fichier temporaire
    await unlink(tempQueryFile);

    if (stderr) {
      console.error('Erreur Prolog:', stderr);
      return NextResponse.json(
        { error: 'Erreur lors de l\'exécution de la requête Prolog', details: stderr },
        { status: 500 }
      );
    }

    // Parser la réponse
    const response = stdout.trim();
    return NextResponse.json({ result: response });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error.message },
      { status: 500 }
    );
  }
}