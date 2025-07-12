import TagSelector from '../../components/TagSelector/TagSelector';
import './AskQuestion.css';

const AskQuestion = () => {
  return (
    <div className="ask-question">
      <h1 className="ask-question__title">Ask a Question</h1>
      <form className="ask-question__form">
        <input type="text" placeholder="Title" className="ask-question__input" required />
        <TagSelector />
        <button type="submit" className="ask-question__submit">Submit Question</button>
      </form>
    </div>
  );
};

export default AskQuestion;
